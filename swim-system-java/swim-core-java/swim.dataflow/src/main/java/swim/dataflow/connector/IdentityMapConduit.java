package swim.dataflow.connector;

/**
 * Trivial {@link MapConduit} that passes its values on unchanged.
 *
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 */
public class IdentityMapConduit<K, V> extends AbstractMapJunction<K, V> implements MapConduit<K, K, V, V> {
  @Override
  public void notifyChange(final K key, final Deferred<V> value, final Deferred<MapView<K, V>> map) {
    emit(key, value, map);
  }

  @Override
  public void notifyRemoval(final K key, final Deferred<MapView<K, V>> map) {
    emitRemoval(key, map);
  }
}
