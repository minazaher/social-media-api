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
       
        input PostDataInput{
        content: String!
        title: String!
        imageUrl: String!
        }
        
       type PostData {
       posts: [Post!]
       totalItems: Int! 
       }
     
        type AuthData{
            id: String!
            token: String! 
        }
        
        type RootMutation {
            createUser(user: UserDataInput): User!
            createPost(post: PostDataInput): Post!
            updatePost(id: ID!, postInput: PostDataInput): Post!
            deletePost (id: ID!): Boolean!
            updateStatus(status: String!): User!
        }
            
        type RootQuery {
            login(email: String!, password: String!): AuthData!
            getAllPosts(pageNumber: Int!): PostData
            getPost (id: ID!): Post!
            getUser: User!
        }
        
        schema {
            mutation: RootMutation
            query : RootQuery
        }
`)