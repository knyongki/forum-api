class DetailComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, username, date, content, replies, isDeleted,
    } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = content;
    this.replies = replies;
    this.isDeleted = isDeleted;
  }

  _verifyPayload(payload) {
    if (this._isPayloadNotContainNeededProperty(payload)) {
      throw new Error('DETAIL_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    if (this._isPayloadNotMeetDataTypeSpecification(payload)) {
      throw new Error('DETAIL_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _isPayloadNotContainNeededProperty({
    id, username, date, content, replies, isDeleted,
  }) {
    return (!id
      || !username
      || !date
      || !content
      || !replies
      || isDeleted === undefined);
  }

  _isPayloadNotMeetDataTypeSpecification({
    id, username, date, content, replies, isDeleted,
  }) {
    return (
      typeof id !== 'string'
      || typeof username !== 'string'
      || typeof date !== 'string'
      || typeof content !== 'string'
      || !(Array.isArray(replies))
      || typeof isDeleted !== 'boolean'
    );
  }
}

module.exports = DetailComment;
