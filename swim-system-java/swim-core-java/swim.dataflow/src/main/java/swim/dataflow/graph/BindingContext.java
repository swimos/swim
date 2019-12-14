package swim.dataflow.graph;

/**
 * Context passed through {@link SwimStream} and {@link MapSwimStream} instances.
 */
public interface BindingContext {

  <T> SinkHandle<Unit, T> bindSink(SwimStream<T> in, Sink<T> out);

  <K, V> SinkHandle<K, V> bindSink(MapSwimStream<K, V> in, MapSink<K, V> out);

  /**
   * Create a unique ID for a stream.
   * @return The ID.
   */
  String createId();

  /**
   * Cleam a unique ID for a stream.
   * @param id The ID.
   */
  void claimId(String id);
}
