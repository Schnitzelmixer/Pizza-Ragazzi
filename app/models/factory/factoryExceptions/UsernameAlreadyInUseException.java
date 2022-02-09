package models.factory.factoryExceptions;

/**
 * The type Username already in use exception.
 */
public class UsernameAlreadyInUseException extends RuntimeException {

    /**
     * Instantiates a new Username already in use exception.
     *
     * @param message the message
     */
    public UsernameAlreadyInUseException(String message) {
        super(message);
    }
}