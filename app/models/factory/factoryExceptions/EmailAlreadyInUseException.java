package models.factory.factoryExceptions;

/**
 * The type Email already in use exception.
 */
public class EmailAlreadyInUseException extends RuntimeException {
    /**
     * Instantiates a new Email already in use exception.
     */
    public EmailAlreadyInUseException() {
    }

    /**
     * Instantiates a new Email already in use exception.
     *
     * @param message the message
     */
    public EmailAlreadyInUseException(String message) {
        super(message);
    }

    /**
     * Instantiates a new Email already in use exception.
     *
     * @param message the message
     * @param cause   the cause
     */
    public EmailAlreadyInUseException(String message, Throwable cause) {
        super(message, cause);
    }

    /**
     * Instantiates a new Email already in use exception.
     *
     * @param cause the cause
     */
    public EmailAlreadyInUseException(Throwable cause) {
        super(cause);
    }
}
