import Head from 'next/head'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import Link from 'next/link'
import { Post, Comment } from '../../../../types'
import Image from 'next/image'
import Sidebar from '../../../../components/Sidebar'
import Axios from 'axios'
import classNames from 'classnames'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useAuthState } from '../../../../context/auth'
import ActionButton from '../../../../components/ActionButton'
import { useState, FormEvent, useEffect } from 'react'

dayjs.extend(relativeTime)

export default function PostPage() {
  //local state
  const [newComment, setNewComment] = useState('')

  const [description, setDescription] = useState('')

  // global state
  const { authenticated, user } = useAuthState()

  //utils
  const router = useRouter()
  const { identifier, sub, slug } = router.query

  const { data: post, error } = useSWR<Post>(
    identifier && slug ? `/posts/${identifier}/${slug}` : null
  )

  const { data: comments, revalidate } = useSWR<Comment[]>(
    identifier && slug ? `/posts/${identifier}/${slug}/comments` : null
  )

  if (error) router.push('/')

  useEffect(() => {
    if (!post) return
    let desc = post.body || post.title
    desc = desc.substring(0, 158).concat('..')
    setDescription(desc)
  }, [post])

  const vote = async (value: number, comment?: Comment) => {
    // if not logged in go to login
    if (!authenticated) router.push('/login')

    //if vote is the same reset vote
    if (
      (!comment && value === post.userVote) ||
      (comment && comment.userVote === value)
    )
      value = 0

    try {
      await Axios.post('/misc/vote', {
        identifier,
        slug,
        commentIdentifier: comment?.identifier,
        value,
      })

      revalidate()
    } catch (err) {
      console.log(err)
    }
  }

  const submitComment = async (event: FormEvent) => {
    event.preventDefault()
    if (newComment.trim() === '') return

    try {
      await Axios.post(`/posts/${post.identifier}/${post.slug}/comments`, {
        body: newComment,
      })

      setNewComment('')
      revalidate()
    } catch (err) {
      console.log(err)
    }
  }
  return (
    <>
      <Head>
        <title>{post?.title}</title>
        <meta name='description' content={description}></meta>
        <meta property='og:description' content={description} />
        <meta property='twitter:description' content={description} />
        <meta property='og:title' content={post?.title} />
        <meta property='twitter:title' content={post?.title} />
      </Head>
      <Link href={`/r/${sub}`}>
        <a>
          <div className='flex items-center w-full h-20 p-8 bg-blue-500'>
            <div className='flex containter'>
              {post && (
                <div className='w-8 h-8 mr-2 overflow-hidden rounded-full'>
                  <Image
                    src={post.sub.imageUrl}
                    height={(8 * 16) / 2}
                    width={(8 * 16) / 2}
                  />
                </div>
              )}
              <p className='text-xl font-semibold text-white'>/r/{sub}</p>
            </div>
          </div>
        </a>
      </Link>
      <div className='container flex pt-5'>
        {/* Post */}
        <div className='w-160'>
          <div className='bg-white rounded'>
            {post && (
              <>
                <div className='flex'>
                  {/* Vote Section */}

                  <div className='flex-shrink-0 w-10 py-2 text-center rounded-l'>
                    {/* up vote */}
                    <div
                      className='w-6 mx-auto text-gray-400 rounded cursor-pointer hover:text-red-500 hover:bg-gray-300'
                      onClick={() => vote(1)}
                    >
                      <i
                        className={classNames('icon-arrow-up', {
                          'text-red-500': post.userVote === 1,
                        })}
                      ></i>
                    </div>
                    <p className='text-xs font-bold'>{post.voteScore}</p>
                    {/* dowb vote */}
                    <div
                      className='w-6 mx-auto text-gray-400 rounded cursor-pointer hover:text-blue-600 hover:bg-gray-300 '
                      onClick={() => vote(-1)}
                    >
                      <i
                        className={classNames('icon-arrow-down', {
                          'text-blue-600': post.userVote === -1,
                        })}
                      ></i>
                    </div>
                  </div>
                  <div className='py-2 pr-2'>
                    <div className='flex items-center'>
                      <p className='text-xs text-gray-500'>
                        Posted by
                        <Link href={`/u/${post.username}`}>
                          <a className='mx-1 hover:underline'>
                            /u/{post.username}
                          </a>
                        </Link>
                        <Link href={post.url}>
                          <a className='mx-1 hover:underline'>
                            {dayjs(post.createdAt).fromNow()}
                          </a>
                        </Link>
                      </p>
                    </div>
                    {/* post title */}
                    <h1 className='my-1 text-xl font-medium'>{post.title}</h1>
                    {/* pody body*/}
                    <p className='my-2 text-sm'>{post.body}</p>

                    {/* actions*/}
                    <div className='flex'>
                      <Link href={post.url}>
                        <a>
                          <ActionButton>
                            <i className='mr-1 fas fa-comment-alt fa-xs'></i>
                            <span className='font-bold'>
                              {post.commentCount} Comments
                            </span>
                          </ActionButton>
                        </a>
                      </Link>
                      <ActionButton>
                        <i className='mr-1 fas fa-share fa-xs'></i>
                        <span className='font-bold'>Share</span>
                      </ActionButton>
                      <ActionButton>
                        <i className='mr-1 fas fa-bookmark fa-xs'></i>
                        <span className='font-bold'>Save</span>
                      </ActionButton>
                    </div>
                  </div>
                </div>
                {/* Comment input area*/}
                <div className='pl-10 pr-6 mb-4'>
                  {authenticated ? (
                    <div>
                      <p className='mb-1 text-xs'>
                        Comment as{' '}
                        <Link href={`/u/${user.username}`}>
                          <a className='font-semibold text-blue-500'>
                            {user.username}
                          </a>
                        </Link>
                      </p>
                      <form onSubmit={submitComment}>
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className='w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-gray-600'
                        ></textarea>
                        <div className='flex justify-end'>
                          <button
                            className='px-3 py-1 blue button'
                            disabled={newComment.trim() === ''}
                          >
                            Comment
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className='flex items-center justify-between px-2 py-4 border border-gray-200 rounded'>
                      <p className='font-semibold text-gray-400'>
                        Log in or sign up to leave a comment
                      </p>
                      <div>
                        <Link href='/'>
                          <a className='px-4 py-1 mr-4 hollow blue button'>
                            Login
                          </a>
                        </Link>
                        <Link href='/reister'>
                          <a className='px-4 py-1 blue button'>Sign Up</a>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                <hr />

                {/* Comments feed */}
                {comments?.map((comment) => (
                  <div className='flex' key={comment.identifier}>
                    {/* Vote Section */}

                    <div className='flex-shrink-0 w-10 py-2 text-center rounded-l'>
                      {/* up vote */}
                      <div
                        className='w-6 mx-auto text-gray-400 rounded cursor-pointer hover:text-red-500 hover:bg-gray-300'
                        onClick={() => vote(1, comment)}
                      >
                        <i
                          className={classNames('icon-arrow-up', {
                            'text-red-500': comment.userVote === 1,
                          })}
                        ></i>
                      </div>
                      <p className='text-xs font-bold'>{comment.voteScore}</p>
                      {/* dowb vote */}
                      <div
                        className='w-6 mx-auto text-gray-400 rounded cursor-pointer hover:text-blue-600 hover:bg-gray-300 '
                        onClick={() => vote(-1, comment)}
                      >
                        <i
                          className={classNames('icon-arrow-down', {
                            'text-blue-600': comment.userVote === -1,
                          })}
                        ></i>
                      </div>
                    </div>
                    <div className='py-2 pr-2'>
                      <p className='mb-1 text-xs leading-none'>
                        <Link href={`/u/${comment.username}`}>
                          <a className='mr-1 font-bold hover:underline'>
                            {comment.username}
                          </a>
                        </Link>
                        <span className='text-gray-600'>
                          {`
                          ${comment.voteScore}
                          points •
                          ${dayjs(comment.createdAt).fromNow()}
                          `}
                        </span>
                      </p>
                      <p>{comment.body}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
        {/* Sidebar */}
        {post && <Sidebar sub={post.sub} />}
      </div>
    </>
  )
}
