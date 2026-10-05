import Message from '../models/Message.js';
import Team from '../models/Team.js';
import Notification from '../models/Notification.js';

// @desc    Get chat messages for a team
// @route   GET /api/chat/:teamId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { teamId } = req.params;

    const messages = await Message.find({ team: teamId })
      .populate('sender', 'name email role avatar')
      .populate('receiver', 'name email role avatar')
      .sort({ createdAt: 1 });

    res.json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send a message (Guide <-> Team Leader)
// @route   POST /api/chat
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { teamId, message, receiverId } = req.body;

    if (!message && !req.file) {
      return res.status(400).json({ success: false, message: 'Message text or attachment is required' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    let fileUrl = '';
    let fileName = '';
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
      fileName = req.file.originalname;
    }

    // Determine receiver if not passed
    let finalReceiver = receiverId;
    if (!finalReceiver) {
      if (req.user.role === 'team_leader') {
        finalReceiver = team.guide;
      } else {
        finalReceiver = team.leader;
      }
    }

    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: finalReceiver,
      team: team._id,
      message: message || (fileName ? `Shared attachment: ${fileName}` : ''),
      fileUrl,
      fileName,
    });

    const populated = await Message.findById(newMessage._id)
      .populate('sender', 'name email role avatar')
      .populate('receiver', 'name email role avatar');

    // Create Notification
    if (finalReceiver) {
      await Notification.create({
        recipient: finalReceiver,
        sender: req.user._id,
        title: `New Message from ${req.user.name}`,
        message: message ? (message.length > 60 ? `${message.substring(0, 60)}...` : message) : 'Sent a file',
        type: 'message',
        link: `/chat/${team._id}`,
      });
    }

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
