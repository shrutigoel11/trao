import mongoose from 'mongoose';
const UserSchema = new mongoose.Schema({ email:{type:String,unique:true,lowercase:true,trim:true}, passwordHash:String }, {timestamps:true});
export default mongoose.model('User', UserSchema);
