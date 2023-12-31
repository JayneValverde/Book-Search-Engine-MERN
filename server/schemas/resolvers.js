const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = { 
    Query: {

        me: async (parent, args, context) => {
            // checks if users exist
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('__v - password')
                    .populate('savedBooks');

                    return userData;
                }
                throw new AuthenticationError("Must be logged in!")
        },
    },

    Mutation: {

        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            // check if user exists with email and credentials
            if (!user) {
                throw new AuthenticationError("User not found");
            }
            const correctPassword = await user.isCorrectPassword(password);

            // check password
            if (!correctPassword) {
                throw new AuthenticationError("Incorrect credentials");
            }
            const token = signToken(user);
            return { token, user };
        },

        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);

            return { token, user };
        },

        saveBook: async (parent, { newBook }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    {_id: context.user._id,},
                    { $push: { savedBooks: newBook }},
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError("Must be logged in!");
        },
        removeBook: async (parent, { bookId }, context) => {
            if (context.user){
                const updatedUser = await User.findOneAndUpdate(
                    {_id: context.user._id},
                    { $pull: { savedBooks: { bookId }}},
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('Login required');
        },
    },
};

module.exports = resolvers;