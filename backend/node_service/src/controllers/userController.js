import { User, Brand, Product, Detection, Takedown, Subscription, AuditLog } from '../models/index.js';

export const updateProfile = async (req, res) => {
    try {
        const { fullName, email, company } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }

        // Split fullName into first_name and last_name
        if (fullName !== undefined) {
            const nameParts = (fullName || '').trim().split(/\s+/);
            user.first_name = nameParts[0] || '';
            user.last_name = nameParts.slice(1).join(' ') || '';
        }

        if (email !== undefined) {
            // Check if email is already taken
            if (email !== user.email) {
                const emailExists = await User.findOne({ where: { email } });
                if (emailExists) {
                    return res.status(400).json({ status: 'fail', message: 'Email already in use' });
                }
                user.email = email;
            }
        }

        await user.save();

        // Handle company / Brand update
        if (company !== undefined) {
            let brand = await Brand.findOne({ where: { owner_id: user.id } });
            if (brand) {
                brand.name = company;
                await brand.save();
            } else {
                await Brand.create({
                    owner_id: user.id,
                    name: company
                });
            }
        }

        // Fetch refreshed user data
        const updatedUser = await User.findByPk(user.id, {
            attributes: { exclude: ['password_hash'] },
            include: [{ model: Brand, as: 'brands' }]
        });

        const userData = updatedUser.toJSON();
        userData.name = `${updatedUser.first_name} ${updatedUser.last_name}`.trim();

        res.json({
            status: 'success',
            message: 'Account details saved',
            user: userData
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({ status: 'fail', message: 'Please provide current and new passwords' });
        }

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }

        // Verify current password
        const isMatch = await user.matchPassword(current_password);
        if (!isMatch) {
            return res.status(400).json({ status: 'fail', message: 'Incorrect current password' });
        }

        // Set the new password hash (hook handles hashing)
        user.password_hash = new_password;
        await user.save();

        res.json({
            status: 'success',
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const enable2FA = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }

        user.two_factor_enabled = true;
        await user.save();

        res.json({
            status: 'success',
            message: 'Two-factor enabled (check your email for setup)'
        });
    } catch (error) {
        console.error('Enable 2FA Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const disable2FA = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }

        user.two_factor_enabled = false;
        await user.save();

        res.json({
            status: 'success',
            message: 'Two-factor disabled successfully'
        });
    } catch (error) {
        console.error('Disable 2FA Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found' });
        }

        // Cascade delete all associated data
        const brands = await Brand.findAll({ where: { owner_id: user.id } });

        for (const brand of brands) {
            const products = await Product.findAll({ where: { brand_id: brand.id } });

            for (const product of products) {
                // Delete Detections associated with Product (including any linked takedowns)
                const detections = await Detection.findAll({ where: { product_id: product.id } });
                for (const detection of detections) {
                    await Takedown.destroy({ where: { detected_match_id: detection.id } });
                    await detection.destroy();
                }
                await product.destroy();
            }

            // Delete remaining detections for the brand
            const brandDetections = await Detection.findAll({ where: { brand_id: brand.id } });
            for (const detection of brandDetections) {
                await Takedown.destroy({ where: { detected_match_id: detection.id } });
                await detection.destroy();
            }

            // Delete Subscription
            await Subscription.destroy({ where: { brand_id: brand.id } });

            // Delete Brand
            await brand.destroy();
        }

        // Delete Audit Logs
        await AuditLog.destroy({ where: { user_id: user.id } });

        // Delete User
        await user.destroy();

        res.json({
            status: 'success',
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Delete Account Error:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};
