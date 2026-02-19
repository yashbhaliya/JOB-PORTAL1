const User = require('../models/user');

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    
    console.log('=== UPDATE PROFILE ===' );
    console.log('User ID:', userId);
    console.log('Update Data:', JSON.stringify(updateData, null, 2));

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: false, upsert: false }
    ).select('-password -verificationToken -resetPasswordToken');

    if (!user) {
      console.log('User not found, checking if user exists...');
      const existingUser = await User.findById(userId);
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found. Please login again.' });
      }
    }
    
    console.log('Updated user:', JSON.stringify(user, null, 2));
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password -verificationToken -resetPasswordToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
