package swim.structure.form;

import java.time.Duration;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Value;

/**
 * Form for standard library {@link Duration}s.
 */
public final class DurationForm extends Form<Duration> {

  private final Duration unit;

  public DurationForm(final Duration unit) {
    this.unit = unit;
  }

  @Override
  public String tag() {
    return "duration";
  }

  @Override
  public Duration unit() {
    return unit;
  }

  @Override
  public Form<Duration> unit(final Duration unit) {
    return new DurationForm(unit);
  }

  @Override
  public Class<?> type() {
    return Duration.class;
  }

  @Override
  public Item mold(final Duration duration) {
    if (duration != null) {
      final Record inner;
      if (duration.getNano() == 0) {
        inner = Record.create(1).slot("seconds", duration.getSeconds());
      } else {
        inner = Record.create(2)
            .slot("seconds", duration.getSeconds()).slot("nanos", duration.getNano());
      }
      return Record.create(1).attr(tag(), inner);
    } else {
      return Item.absent();
    }
  }

  @Override
  public Duration cast(final Item item) {
    final Value header = item.toValue().header(tag());
    if (header.isDefined()) {
      final long seconds = header.get("seconds").longValue();
      final Value nanoVal = header.get("nanos");
      if (nanoVal.isDefined()) {
        return Duration.ofSeconds(seconds, nanoVal.longValue());
      } else {
        return Duration.ofSeconds(seconds);
      }
    } else {
      return null;
    }
  }
}
