import mongoose from 'mongoose';
const KitSchema = new mongoose.Schema({ userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true}, data:{type:Object,required:true}, edits:{type:Object,default:{}}, practice:{type:Object,default:{}} }, {timestamps:true});
export default mongoose.model('Kit', KitSchema);
