package services;

/**
 * This interface demonstrates how to createUser a component that is injected
 * into a controller. The interface represents a counter that returns a
 * incremented number each time it is called.
 *
 * {@link AtomicCounter} implementation.
 */
public interface Counter {
    int nextCount();
}
