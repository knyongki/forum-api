const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../../Domains/replies/entities/DetailReply');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrate the get thread detail action correctly', async () => {
    // arrange
    const useCaseParam = {
      threadId: 'thread-123',
    };

    const expectedDetailThread = new DetailThread({
      id: 'thread-1234',
      title: 'some thread title',
      body: 'some thread body',
      date: '2020',
      username: 'John Doe',
      comments: [],
    });

    const retrievedComments = [
      new DetailComment({
        id: 'comment-123',
        username: 'user A',
        date: '2021',
        content: 'comment A',
        replies: [],
        isDeleted: false,
      }),
      new DetailComment({
        id: 'comment-456',
        username: 'user B',
        date: '2020',
        content: 'comment B',
        replies: [],
        isDeleted: false,
      }),
    ];

    const retrievedReplies = [
      new DetailReply({
        id: 'reply-123',
        commentId: 'comment-123',
        content: 'reply A',
        date: '2021',
        username: 'user C',
        isDeleted: false,
      }),
      new DetailReply({
        id: 'reply-456',
        commentId: 'comment-456',
        content: 'reply B',
        date: '2021',
        username: 'user D',
        isDeleted: false,
      }),
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedDetailThread));
    mockThreadRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(retrievedReplies));

    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(retrievedComments));

    const getThreadDetailUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // filtering retrievedComments to remove isDeleted and likeCount
    const {
      isDeleted: isDeletedCommentA,
      ...filteredCommentDetailsA
    } = retrievedComments[0];
    const {
      isDeleted: isDeletedCommentB,
      ...filteredCommentDetailsB
    } = retrievedComments[1];

    // filtering retrievedReplies to removed commentId and isDeleted
    const {
      commentId: commentIdReplyA, isDeleted: isDeletedReplyA,
      ...filteredReplyDetailsA
    } = retrievedReplies[0];
    const {
      commentId: commentIdReplyB, isDeleted: isDeletedReplyB,
      ...filteredReplyDetailsB
    } = retrievedReplies[1];

    const expectedCommentsAndReplies = [
      { ...filteredCommentDetailsA, replies: [filteredReplyDetailsA] },
      { ...filteredCommentDetailsB, replies: [filteredReplyDetailsB] },
    ];

    getThreadDetailUseCase._checkIsDeletedComments = jest.fn()
      .mockImplementation(() => [filteredCommentDetailsA, filteredCommentDetailsB]);

    getThreadDetailUseCase._getRepliesForComments = jest.fn()
      .mockImplementation(() => expectedCommentsAndReplies);

    // action
    const useCaseResult = await getThreadDetailUseCase.execute(useCaseParam);

    // assert
    expect(useCaseResult).toEqual(new DetailThread({
      ...expectedDetailThread, comments: expectedCommentsAndReplies,
    }));
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseParam.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCaseParam.threadId);
    expect(mockThreadRepository.getRepliesByThreadId).toBeCalledWith(useCaseParam.threadId);

    expect(getThreadDetailUseCase._checkIsDeletedComments).toBeCalledWith(retrievedComments);
    expect(getThreadDetailUseCase._getRepliesForComments)
      .toBeCalledWith([filteredCommentDetailsA, filteredCommentDetailsB], retrievedReplies);
  });

  it('should operate the branching in the _checkIsDeletedComments function properly', () => {
    // arrange
    const getThreadDetailUseCase = new GetThreadUseCase(
      { threadRepository: {}, commentRepository: {} },
    );
    const retrievedComments = [
      new DetailComment({
        id: 'comment-123',
        username: 'user A',
        date: '2021',
        content: 'comment A',
        replies: [],
        isDeleted: true,
      }),
      new DetailComment({
        id: 'comment-456',
        username: 'user B',
        date: '2020',
        content: 'comment B',
        replies: [],
        isDeleted: false,
      }),
    ];
    const {
      isDeleted: isDeletedCommentA,
      ...filteredCommentDetailsA
    } = retrievedComments[0];
    const {
      isDeleted: isDeletedCommentB,
      ...filteredCommentDetailsB
    } = retrievedComments[1];
    const SpyCheckIsDeletedComments = jest.spyOn(getThreadDetailUseCase, '_checkIsDeletedComments');

    // action
    getThreadDetailUseCase._checkIsDeletedComments(retrievedComments);

    // assert
    expect(SpyCheckIsDeletedComments)
      .toReturnWith([
        { ...filteredCommentDetailsA, content: '**komentar telah dihapus**' },
        filteredCommentDetailsB]);

    SpyCheckIsDeletedComments.mockClear();
  });

  it('should operate the branching in the _getRepliesForComments function properly', () => {
    // arrange
    const getThreadDetailUseCase = new GetThreadUseCase(
      { threadRepository: {}, commentRepository: {} },
    );
    const filteredComments = [
      {
        id: 'comment-123',
        username: 'user A',
        date: '2021',
        content: '**komentar telah dihapus**',
        replies: [],
      },
      {
        id: 'comment-456',
        username: 'user B',
        date: '2020',
        content: 'comment B',
        replies: [],
      },
    ];

    const retrievedReplies = [
      new DetailReply({
        id: 'reply-123',
        commentId: 'comment-123',
        content: 'reply A',
        date: '2021',
        username: 'user C',
        isDeleted: true,
      }),
      new DetailReply({
        id: 'reply-456',
        commentId: 'comment-456',
        content: 'reply B',
        date: '2021',
        username: 'user D',
        isDeleted: false,
      }),
    ];

    const {
      commentId: commentIdReplyA, isDeleted: isDeletedReplyA,
      ...filteredReplyDetailsA
    } = retrievedReplies[0];
    const {
      commentId: commentIdReplyB, isDeleted: isDeletedReplyB,
      ...filteredReplyDetailsB
    } = retrievedReplies[1];

    const expectedCommentsAndReplies = [
      { ...filteredComments[0], replies: [{ ...filteredReplyDetailsA, content: '**balasan telah dihapus**' }] },
      { ...filteredComments[1], replies: [filteredReplyDetailsB] },
    ];

    const SpyGetRepliesForComments = jest.spyOn(getThreadDetailUseCase, '_getRepliesForComments');

    // action
    getThreadDetailUseCase
      ._getRepliesForComments(filteredComments, retrievedReplies);

    // assert
    expect(SpyGetRepliesForComments)
      .toReturnWith(expectedCommentsAndReplies);

    SpyGetRepliesForComments.mockClear();
  });
});
