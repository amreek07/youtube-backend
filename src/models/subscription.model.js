import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema(
    {
        subscriber: {
            type: Schema.Types.ObjectId, //the person who is subscribing to this user's channel
            ref: "User"
        },
        channel: {
            type: Schema.Types.ObjectId, //this user is subscribing to other youtube users or channels
            ref: "User"
        }
    }, 
    { timestamps:true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);