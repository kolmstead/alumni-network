import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Bring whitelist and honoraryMember list from javascript object to mongodb
const UserWhiteList = new Schema ({
  whitelist: {
    githubUserName: { type: String, default: '' },
    fccUserName: { type: String, default: '' },
    reason: { type: String, default: ''}
  },
  honoraryMembers: {
    username: { type: String, default: '' },
    reason: { type: String, default: '' }
  }
});

console.log("Hello from whitelist");

export default mongoose.model('UserWhiteList', UserWhiteList);