export class InvalidTokenError extends Error {
  constructor() {
    super("Access token is required");
    this.name = "InvalidTokenError";
  }
}
