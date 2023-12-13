const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
  {
    message: {
     type: String, 
     required: true
    },
    sender: {
      type: String,
      required: true,
    },
    receiver:{
      type:String,
      required:true
    },
    createdAt:{
      type:Date
    }
  }
);

module.exports = mongoose.model("Messages", MessageSchema);

// export const TenantCollectionName = '';
// export const TenantSchema = SchemaFactory.createForClass(Tenant);
// TenantSchema.plugin(require('mongoose-autopopulate'));
// export type TenantDocument = Tenant & mongoose.Document;
