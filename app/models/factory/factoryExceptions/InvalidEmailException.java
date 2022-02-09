package models.factory.factoryExceptions;

/**
 * The type Invalid email exception.
 */
public class InvalidEmailException extends RuntimeException {
    /**
     * Instantiates a new Invalid email exception.
     */
    public InvalidEmailException() {
    }

    /**
     * Instantiates a new Invalid email exception.
     *
     * @param message the message
     */
    public InvalidEmailException(String message) {
        super(message);
    }

    /**
     * Instantiates a new Invalid email exception.
     *
     * @param message the message
     * @param cause   the cause
     */
    public InvalidEmailException(String message, Throwable cause) {
        super(message, cause);
    }

    /**
     * Instantiates a new Invalid email exception.
     *
     * @param cause the cause
     */
    public InvalidEmailException(Throwable cause) {
        super(cause);
    }
}
