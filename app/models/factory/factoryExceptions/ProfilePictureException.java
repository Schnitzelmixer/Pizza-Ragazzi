package models.factory.factoryExceptions;

/**
 * The type Profile picture exception.
 */
public class ProfilePictureException extends RuntimeException {
    /**
     * Instantiates a new Profile picture exception.
     */
    public ProfilePictureException() {
    }

    /**
     * Instantiates a new Profile picture exception.
     *
     * @param message the message
     */
    public ProfilePictureException(String message) {
        super(message);
    }

    /**
     * Instantiates a new Profile picture exception.
     *
     * @param message the message
     * @param cause   the cause
     */
    public ProfilePictureException(String message, Throwable cause) {
        super(message, cause);
    }

    /**
     * Instantiates a new Profile picture exception.
     *
     * @param cause the cause
     */
    public ProfilePictureException(Throwable cause) {
        super(cause);
    }
}
