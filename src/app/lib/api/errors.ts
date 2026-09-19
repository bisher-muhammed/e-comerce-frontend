export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserFacingError";
  }
}

export class SessionUnavailableError extends UserFacingError {
  constructor() {
    super(
      "We couldn't confirm your session right now. Please try again in a moment."
    );
    this.name = "SessionUnavailableError";
  }
}
