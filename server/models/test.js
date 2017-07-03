//Peter's api/verify-credentials code to use mongo vs helpers/user-whitelist.js

router.post('/api/verify-credentials', isAuthenticated, (req, res) => {
  var username, honoraryMember = false, whitelistedUser = false;
  const { mongoId } = req.body;
  // if user is whitelisted, use their alternate username:
  WhiteListedUser.findOne({ githubUsername: req.body.username }, (err, user) => {
    if (err) throw err;
    if (user) {
      username = user.fccUsername;
      whitelistedUser = true;
    } else {
      username = req.body.username;
    }
    // if user is honorary member, they will be let in w/o certs:
    HonoraryMember.findOne({ username: username.toLowerCase() }, (err, user) => {
      if (err) throw err;
      if (user) {
        honoraryMember = true;
      }
      // process FCC verification...
      processVerification(username, honoraryMember, whitelistedUser)
      .then(certs => {
        // update user as verified in DB or delete
        handleProcessedUser(certs, mongoId, req, res, username);
      });;
    });
  });
});

const processVerification = (username, honoraryMember, whitelistedUser) => {
  console.log('processing verification for ' +
    `${honoraryMember ? 'honorary member' : ''}` +
    `${whitelistedUser ? 'white-listed user' : ''}` + ` ${username}`);

  return axios.all([
    getFrontEndCert(username),
    getBackEndCert(username),
    getDataVisCert(username)
  ]).then(axios.spread((frontCert, backCert, dataCert) => {
    let totalRedirects =
    frontCert.request._redirectCount +
    backCert.request._redirectCount +
    dataCert.request._redirectCount;
    if (honoraryMember || totalRedirects < 3) {
      return {
        Front_End: frontCert.request._redirectCount === 0 ? true : false,
        Back_End: backCert.request._redirectCount === 0 ? true : false,
        Data_Visualization: dataCert.request._redirectCount === 0 ? true : false,
      }
    } else {
      if (isAllowedForDev) {
        return {
          Front_End: false,
          Back_End: false,
          Data_Visualization: false,
        }
      } else {
        return false;
      }
    }
  }))
}

const handleProcessedUser = (certs, mongoId, req, res, username) => {
  if (!certs) {
    // user not verified, res with error
    User.findById(mongoId, (err, user) => {
      if (err) throw err;
      user.verifiedUser = false;
      user.save();
      res.status(401).json({ error: 'User cannot be verified' });
    });
  } else {
    // verified user, proceed
    User.findById(mongoId, (err, user) => {
      if (err) throw err;
      /* we need to overwrite their session username too
      (only matters for whitelisted users) */
      req.user.username = username;
      user.username = username;
      user.fccCerts = certs;
      user.verifiedUser = true;
      user.save();
      req.user.verifiedUser = true;
      req.user.fccCerts = certs;
      res.json({ user });
    });
  }
}