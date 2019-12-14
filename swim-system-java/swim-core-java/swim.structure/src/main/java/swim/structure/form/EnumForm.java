package swim.structure.form;

import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Text;

/**
 * {@link Form} for an enumerated type that uses the string name of the constants.
 * @param <E> The type of the enumeration.
 */
public class EnumForm<E extends Enum<E>> extends Form<E> {

  private final Class<E> enumCls;

  public EnumForm(final Class<E> enumCls) {
    this.enumCls = enumCls;
  }

  @Override
  public Class<E> type() {
    return enumCls;
  }

  @Override
  public Item mold(final E object) {
    if (object == null) {
      return Item.absent();
    } else {
      return Text.from(object.name());
    }
  }

  @Override
  public E cast(final Item item) {
    if (item.isDefined()) {
      return Enum.valueOf(enumCls, item.stringValue());
    } else {
      return null;
    }
  }
}
