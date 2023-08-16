const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        getSingleUser: async (parent, args, context) => {
            const userToFind = context.user || args;
        
            const foundUser = await User.findOne({
                $or: [{ _id: userToFind._id }, { username: userToFind.username }],
            });
        
            if (!foundUser) {
                throw new Error('Cannot find a user with this id or username!');
            }
        
            return foundUser;
        },
    },
    Mutation: {
        createUser: async (parent, args) => {
            const user = await User.create(args);
        
            if (!user) {
                throw new Error('Something is wrong with user creation!');
            }
        
            const token = signToken(user);
        
            return { token, user };
        },
        
        login: async (parent, { username, email, password }) => {
            const user = await User.findOne({ $or: [{ username }, { email }] });
        
            if (!user) {
                throw new Error("Can't find this user");
            }
        
            const correctPw = await user.isCorrectPassword(password);
        
            if (!correctPw) {
                throw new Error('Wrong password!');
            }
        
            const token = signToken(user);
        
            return { token, user };
        },
        
        saveBook: async (parent, { input }, context) => {
            if (!context.user) {
                throw new Error('You need to be logged in!');
            }
        
            try {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: input } },
                    { new: true, runValidators: true }
                );
            
                return updatedUser;
            } catch (err) {
                throw new Error(err);
            }
        },
        
        deleteBook: async (parent, { bookId }, context) => {
            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId } } },
                { new: true }
            );
        
            if (!updatedUser) {
                throw new Error("Couldn't find user with this id or book not found in saved books!");
            }
        
            return updatedUser;
        }
    }
};

module.exports = resolvers;