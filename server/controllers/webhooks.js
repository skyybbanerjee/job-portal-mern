import { Webhook } from "svix";
import User from "../models/UserModel.js";

export const clerkWebhooks = async (req, res) => {
  try {
    // Verify webhook signature
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    await whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    });

    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses?.[0]?.email_address || "No email",
          name: `${data.first_name || "Unknown"} ${data.last_name || ""}`,
          image: data.image_url || "default-image-url",
          resume: "",
        };
        await User.create(userData);
        res.json({});
        break;
      }
      case "user.updated": {
        const updatedUserData = {
          email: data.email_addresses?.[0]?.email_address || "No email",
          name: `${data.first_name || "Unknown"} ${data.last_name || ""}`,
          image: data.image_url || "default-image-url",
        };
        const user = await User.findById(data.id);
        if (!user) {
          res.status(404).json({ message: "User not found" });
          return;
        }
        await User.findByIdAndUpdate(data.id, updatedUserData);
        res.json({});
        break;
      }
      case "user.deleted": {
        const user = await User.findById(data.id);
        if (!user) {
          res.status(404).json({ message: "User not found" });
          return;
        }
        await User.findByIdAndDelete(data.id);
        res.json({});
        break;
      }
      default:
        console.error("Unhandled event type:", type);
        res.status(400).json({ message: `Unhandled event type: ${type}` });
    }
  } catch (error) {
    if (error instanceof Webhook.VerifyError) {
      console.error("Webhook verification failed:", error.message);
      res.status(401).json({ message: "Invalid webhook signature" });
    } else {
      console.error("Unhandled error:", error.message);
      res.status(500).json({ message: `Webhooks Error: ${error.message}` });
    }
  }
};
