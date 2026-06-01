import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { User, Brand } from '../models/index.js';
import dotenv from 'dotenv';

dotenv.config();

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
    proxy: true
},
async function(accessToken, refreshToken, profile, done) {
    try {
        const email = profile.emails[0].value;
        const googleId = profile.id;
        
        let user = await User.findOne({ where: { google_id: googleId } });
        
        if (!user) {
            user = await User.findOne({ where: { email } });
            if (user) {
                user.google_id = googleId;
                await user.save();
            } else {
                user = await User.create({
                    first_name: profile.name.givenName || 'User',
                    last_name: profile.name.familyName || '',
                    email: email,
                    google_id: googleId,
                    is_verified: true,
                    role: 'client'
                });
                await Brand.create({ owner_id: user.id, name: `${user.first_name}'s Brand`, website_url: '' });
            }
        }
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

// GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/api/auth/github/callback",
    proxy: true
},
async function(accessToken, refreshToken, profile, done) {
    try {
        // GitHub doesn't always provide email in the main profile if it's private
        const email = profile.emails ? profile.emails[0].value : `${profile.username}@github.com`;
        const githubId = profile.id;
        
        let user = await User.findOne({ where: { github_id: githubId } });
        
        if (!user) {
            user = await User.findOne({ where: { email } });
            if (user) {
                user.github_id = githubId;
                await user.save();
            } else {
                const nameParts = (profile.displayName || profile.username).split(' ');
                user = await User.create({
                    first_name: nameParts[0] || 'User',
                    last_name: nameParts.slice(1).join(' ') || '',
                    email: email,
                    github_id: githubId,
                    is_verified: true,
                    role: 'client'
                });
                await Brand.create({ owner_id: user.id, name: `${user.first_name}'s Brand`, website_url: '' });
            }
        }
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

export default passport;
