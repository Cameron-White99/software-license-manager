class PublicUserAdapter {
  toPublic(user) {
    const obj = user.toObject ? user.toObject() : { ...user };
    delete obj.password_hash;
    return obj;
  }
}

export default new PublicUserAdapter();
