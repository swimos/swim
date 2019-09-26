package swim.streamlet;

import swim.streaming.MapView;
import swim.util.Deferred;

/**
 * Trivial {@link MapStreamlet} that passes its values on unchanged.
 *
 * @param <K> The type of the keys.
 * @param <V> The type of the values.
 */
public class IdentityMapStreamlet<K, V> extends AbstractMapJunction<K, V> implements MapStreamlet<K, K, V, V> {
  @Override
  public void notifyChange(final K key, final Deferred<V> value, final Deferred<MapView<K, V>> map) {
    emit(key, value, map);
  }

  @Override
  public void notifyRemoval(final K key, final Deferred<MapView<K, V>> map) {
    emitRemoval(key, map);
  }
}
