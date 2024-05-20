/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
class GetThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCaseParam) {
    const { threadId } = useCaseParam;
    const threadDetail = await this._threadRepository.getThreadById(threadId);
    threadDetail.comments = await this._commentRepository.getCommentsByThreadId(threadId);
    const threadReplies = await this._threadRepository.getRepliesByThreadId(threadId);

    threadDetail.comments = this._checkIsDeletedComments(threadDetail.comments);
    threadDetail.comments = this._getRepliesForComments(threadDetail.comments, threadReplies);

    return threadDetail;
  }

  _checkIsDeletedComments(comments) {
    for (let i = 0; i < comments.length; i += 1) {
      comments[i].content = comments[i].isDeleted ? '**komentar telah dihapus**' : comments[i].content;
      delete comments[i].isDeleted;
    }
    return comments;
  }

  _getRepliesForComments(comments, threadReplies) {
    for (let i = 0; i < comments.length; i += 1) {
      const commentId = comments[i].id;
      comments[i].replies = threadReplies
        .filter((reply) => reply.commentId === commentId)
        .map((reply) => {
          const { commentId, ...replyDetail } = reply;
          replyDetail.content = replyDetail.isDeleted ? '**balasan telah dihapus**' : replyDetail.content;
          delete replyDetail.isDeleted;
          return replyDetail;
        });
    }
    return comments;
  }
}

module.exports = GetThreadUseCase;
