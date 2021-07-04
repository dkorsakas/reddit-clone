export interface Post {
  identifier: string
  title: string
  slug: string
  subName: string
  createdAt: string
  updatedAt: string
  sub?: Sub
  body?: string
  username: string
  // Virtual fields
  url: string
  voteScore?: number
  commentCount?: number
  userVote?: number
}

export interface User {
  username: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface Sub {
  createdAt: string
  updatedAt: string
  name: string
  title: string
  description: string
  imageUrn: string
  bannerUrn: string
  posts: Post[]
  //Virtuals
  username: string
  imageUrl: string
  bannerUrl: string
  postCount?: number
}

export interface Comment {
  identifier: string
  body: string
  username: string
  post?: Post
  createdAt: string
  updatedAt: string
  //virtuals
  userVote: number
  voteScore: number
}
