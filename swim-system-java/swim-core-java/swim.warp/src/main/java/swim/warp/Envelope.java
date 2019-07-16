// Copyright 2015-2019 SWIM.AI inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package swim.warp;

import swim.codec.Debug;
import swim.codec.Decoder;
import swim.codec.Encoder;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.Writer;
import swim.recon.Recon;
import swim.structure.Form;
import swim.structure.Value;
import swim.uri.Uri;

public abstract class Envelope implements Debug {
  Envelope() {
    // stub
  }

  public abstract String tag();

  public abstract Form<? extends Envelope> form();

  public abstract Uri nodeUri();

  public abstract Uri laneUri();

  public abstract Value body();

  public abstract Envelope nodeUri(Uri node);

  public abstract Envelope laneUri(Uri lane);

  public abstract Envelope body(Value body);

  @SuppressWarnings("unchecked")
  public Value toValue() {
    return ((Form<Envelope>) form()).mold(this).toValue();
  }

  public Encoder<?, Envelope> reconEncoder() {
    return new EnvelopeEncoder(this);
  }

  public Writer<?, ?> reconWriter() {
    return Recon.write(toValue(), Output.full());
  }

  public Writer<?, ?> writeRecon(Output<?> output) {
    return Recon.write(toValue(), output);
  }

  public String toRecon() {
    return Recon.toString(toValue());
  }

  @Override
  public abstract void debug(Output<?> output);

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static Decoder<Envelope> decoder;
  private static Encoder<Envelope, Envelope> encoder;

  public static Decoder<Envelope> decoder() {
    if (decoder == null) {
      decoder = new EnvelopeDecoder();
    }
    return decoder;
  }

  public static Encoder<Envelope, Envelope> encoder() {
    if (encoder == null) {
      encoder = new EnvelopeEncoder();
    }
    return encoder;
  }

  public static Envelope fromValue(Value value) {
    final String tag = value.tag();
    final Form<? extends Envelope> form = form(tag);
    if (form != null) {
      return form.cast(value);
    } else {
      return null;
    }
  }

  public static Envelope parseRecon(String recon) {
    final Value value = Recon.parse(recon);
    return fromValue(value);
  }

  @SuppressWarnings("unchecked")
  public static <E extends Envelope> Form<E> form(String tag) {
    if ("event".equals(tag)) {
      return (Form<E>) EventMessage.FORM;
    } else if ("command".equals(tag)) {
      return (Form<E>) CommandMessage.FORM;
    } else if ("link".equals(tag)) {
      return (Form<E>) LinkRequest.FORM;
    } else if ("linked".equals(tag)) {
      return (Form<E>) LinkedResponse.FORM;
    } else if ("sync".equals(tag)) {
      return (Form<E>) SyncRequest.FORM;
    } else if ("synced".equals(tag)) {
      return (Form<E>) SyncedResponse.FORM;
    } else if ("unlink".equals(tag)) {
      return (Form<E>) UnlinkRequest.FORM;
    } else if ("unlinked".equals(tag)) {
      return (Form<E>) UnlinkedResponse.FORM;
    } else if ("auth".equals(tag)) {
      return (Form<E>) AuthRequest.FORM;
    } else if ("authed".equals(tag)) {
      return (Form<E>) AuthedResponse.FORM;
    } else if ("deauth".equals(tag)) {
      return (Form<E>) DeauthRequest.FORM;
    } else if ("deauthed".equals(tag)) {
      return (Form<E>) DeauthedResponse.FORM;
    }
    return null;
  }
}
