const {buildSchema} = require('graphql')

module.exports = buildSchema(`

        type Post {
           _id:ID!
           title:String!
           content:String!
           imageUrl:String!
           creator:User!
           createdAt: String!
           updatedAt: String!
        }
       
        type User{
           _id: ID!
           name: String!
           email: String!
           password: String!
           status: String!
           posts:[Post!]
        }
        input UserDataInput{
            name: String!
            email: String!
            password: String!
        }
        
        type RootMutation {
            createUser(user: UserDataInput): User!
        }
        type AuthData{
            id: String!
            token: String!
        }
            
        type RootQuery {
            login(email: String!, password: String!): AuthData!
        }
        
        schema {
            mutation: RootMutation
            query : RootQuery
        }
`)