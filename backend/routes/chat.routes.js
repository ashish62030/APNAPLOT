import express from "express";
import Chat from "../models/chat.model.js";
import { protect } from "../middlewares/auth.middleware.js";

const chatRouter = express.Router();
chatRouter.use(protect);

// create or get chat
chatRouter.post("/start", async (req, res) => {
    try {
        const { propertyId, sellerId, buyerId: providedBuyerId } = req.body;

        let buyerId, finalSellerId;

        if (req.user.role === 'seller') {
            buyerId = providedBuyerId;
            finalSellerId = req.user._id;
        } else {
            buyerId = req.user._id;
            finalSellerId = sellerId;
        }

        if (!buyerId || !finalSellerId) {
            return res.status(400).json({ message: "Missing buyer or seller ID" });
        }

        // Check for an existing chat between this buyer and seller
        let chat = await Chat.findOne({
            buyer: buyerId,
            seller: finalSellerId,
        });

        if (!chat) {
            chat = await Chat.create({
                property: propertyId, // Initial property context
                buyer: buyerId,
                seller: finalSellerId,
                messages: [],
            });
        }

        // Populate users before returning
        chat = await Chat.findById(chat._id)
            .populate("buyer", "name email profilePic")
            .populate("seller", "name email profilePic")
            .populate("property", "title price images");

        res.json(chat);
    } catch (err) {
        res
            .status(500)
            .json({ message: "Error creating or getting chat", error: err.message });
    }
});

// send message
chatRouter.post("/send", async (req, res) => {
    try {
        const { chatId, text, image } = req.body;
        const userId = req.user.id;

        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: "Chat not found" });

        // Security Check: Ensure sender is part of this chat
        if (chat.buyer.toString() !== userId && chat.seller.toString() !== userId) {
            return res.status(403).json({ message: "Not authorized to send messages in this chat" });
        }

        const newMessage = {
            sender: userId,
            text,
            image,
            createdAt: new Date(),
        };
        chat.messages.push(newMessage);
        await chat.save();

        // Return both chat and the specific new message for frontend updates
        const savedMessage = chat.messages[chat.messages.length - 1];

        res.json({ chat, newMessage: savedMessage });
    } catch (err) {
        res.status(500).json({
            message: "Error sending message",
            error: err.message,
        });
    }
});

// get all chats for user
chatRouter.get("/user", async (req, res) => {
    try {
        const userId = req.user._id;
        const chats = await Chat.find({
            $or: [{ buyer: userId }, { seller: userId }],
        })
            .populate("buyer", "name email profilePic")
            .populate("seller", "name email profilePic")
            .populate("property", "title price images")
            .sort({ updatedAt: -1 });
        res.json(chats);
    } catch (err) {
        res
            .status(500)
            .json({ message: "Error fetching user chats", error: err.message });
    }
});

// get chat messages
chatRouter.get("/:chatId", async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId).populate(
            "messages.sender",
            "name profilePic"
        );

        if (!chat) return res.status(404).json({ message: "Chat not found" });

        // Security Check: Ensure user is part of this chat
        const userId = req.user._id.toString();
        if (chat.buyer.toString() !== userId && chat.seller.toString() !== userId) {
            return res.status(403).json({ message: "Not authorized to view these messages" });
        }

        res.json(chat);
    } catch (err) {
        res
            .status(500)
            .json({ message: "Error fetching chat messages", error: err.message });
    }
});

// delete entire chat
chatRouter.delete("/:chatId", async (req, res) => {
    try {
        const userId = req.user._id;
        const chat = await Chat.findById(req.params.chatId);

        if (!chat) return res.status(404).json({ message: "Chat not found" });

        // Ensure user is part of the chat
        if (
            chat.buyer.toString() !== userId.toString() &&
            chat.seller.toString() !== userId.toString()
        ) {
            return res.status(403).json({ message: "Not authorized" });
        }

        await Chat.findByIdAndDelete(req.params.chatId);
        res.json({ message: "Chat deleted successfully" });
    } catch (err) {
        res
            .status(500)
            .json({ message: "Error deleting chat", error: err.message });
    }
});

// delete specific message
chatRouter.delete("/:chatId/message/:messageId", async (req, res) => {
    try {
        const userId = req.user._id;
        const chat = await Chat.findById(req.params.chatId);

        if (!chat) return res.status(404).json({ message: "Chat not found" });

        const message = chat.messages.id(req.params.messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });

        // Only sender can delete their message
        if (message.sender.toString() !== userId.toString()) {
            return res
                .status(403)
                .json({ message: "Not authorized to delete this message" });
        }

        chat.messages.pull(req.params.messageId);
        await chat.save();
        res.json({ message: "Message deleted successfully", chat });
    } catch (err) {
        res
            .status(500)
            .json({ message: "Error deleting message", error: err.message });
    }
});

export default chatRouter;