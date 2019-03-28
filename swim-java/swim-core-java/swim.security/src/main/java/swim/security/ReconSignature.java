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

package swim.security;

import java.security.GeneralSecurityException;
import java.security.Key;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Signature;
import java.security.interfaces.RSAKey;
import swim.codec.Output;
import swim.recon.Recon;
import swim.structure.Attr;
import swim.structure.Data;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Text;
import swim.structure.Value;

public class ReconSignature {
  protected final Value payload;
  protected final Value protectedHeader;
  protected final Value signatureHeader;

  public ReconSignature(Value payload, Value protectedHeader, Value signatureHeader) {
    this.payload = payload;
    this.protectedHeader = protectedHeader;
    this.signatureHeader = signatureHeader;
  }

  public final Value payload() {
    return this.payload;
  }

  public final Value protectedHeader() {
    return this.protectedHeader;
  }

  public final Value signatureHeader() {
    return this.signatureHeader;
  }

  public Data hash() {
    final Value hash = this.signatureHeader.get("hash");
    if (hash instanceof Data) {
      return (Data) hash;
    }
    return null;
  }

  protected Data signingInput() {
    final Output<Data> output = Data.output();
    Recon.structureWriter().writeValue(this.payload, output);
    Recon.structureWriter().writeAttr(Text.from("protected"), this.protectedHeader, output);
    return output.bind();
  }

  public boolean verifySignature(PublicKey publicKey) {
    final String algorithm = algorithm(publicKey);
    try {
      return verifyRsaSignature(Signature.getInstance(algorithm), publicKey);
    } catch (GeneralSecurityException cause) {
      // TODO: return reason
    }
    return false;
  }

  public boolean verifyRsaSignature(Signature signature, PublicKey publicKey) {
    try {
      signature.initVerify(publicKey);
      signature.update(signingInput().asByteBuffer());
      final Data signatureData = hash();
      return signature.verify(signatureData.asByteArray(), 0, signatureData.size());
    } catch (GeneralSecurityException cause) {
      throw new RuntimeException(cause);
    }
  }

  public Value toValue() {
    Value value = this.payload;
    if (this.protectedHeader.isDefined()) {
      value = value.concat(Attr.of("protected", this.protectedHeader));
    }
    value = value.concat(Attr.of("signature", this.signatureHeader));
    return value;
  }

  public static ReconSignature from(Value value) {
    if (value instanceof Record) {
      final Record payload = (Record) value;
      final Item signatureHeader = payload.get(payload.length() - 1);
      if ("signature".equals(signatureHeader.key().stringValue())) {
        payload.remove(payload.length() - 1);
        Item protectedHeader = payload.get(payload.length() - 1);
        if ("protected".equals(protectedHeader.key().stringValue())) {
          payload.remove(payload.length() - 1);
        } else {
          protectedHeader = Value.absent();
        }
        return new ReconSignature(payload, protectedHeader.toValue(), signatureHeader.toValue());
      }
    }
    return null;
  }

  public static ReconSignature parse(String recon) {
    return from(Recon.parse(recon));
  }

  public static ReconSignature signRsa(Signature signature, PrivateKey privateKey,
                                       Value payload, Value protectedHeader,
                                       Value unprotectedHeader) {
    final Output<Data> output = Data.output();
    Recon.structureWriter().writeValue(payload, output);
    Recon.structureWriter().writeAttr(Text.from("protected"), protectedHeader, output);
    final Data signingInput = output.bind();

    try {
      signature.initSign(privateKey);
      signature.update(signingInput.asByteBuffer());
      final Data hash = Data.wrap(signature.sign());
      final Value signatureHeader;
      if (unprotectedHeader.isDefined()) {
        signatureHeader = unprotectedHeader.concat(Slot.of("hash", hash));
      } else {
        signatureHeader = Record.of(Slot.of("hash", hash));
      }
      return new ReconSignature(payload, protectedHeader, signatureHeader);
    } catch (GeneralSecurityException cause) {
      throw new RuntimeException(cause);
    }
  }

  public static ReconSignature signRsa(PrivateKey privateKey, Value payload,
                                       Value protectedHeader, Value unprotectedHeader) {
    final Signature signature;
    final String algorithm = algorithm(privateKey);

    try {
      signature = Signature.getInstance(algorithm);
      return signRsa(signature, privateKey, payload, protectedHeader, unprotectedHeader);
    } catch (GeneralSecurityException cause) {
      throw new RuntimeException(cause);
    }
  }

  public static ReconSignature sign(PrivateKey privateKey, Value payload,
                                    Value protectedHeader, Value unprotectedHeader) {
    if (privateKey instanceof RSAKey) {
      return signRsa(privateKey, payload, protectedHeader, unprotectedHeader);
    } else {
      throw new IllegalArgumentException("unsupported signing key type");
    }
  }

  private static String rsaAlgorithm(RSAKey key) {
    return "SHA256withRSA";
  }

  private static String algorithm(Key key) {
    if (key instanceof RSAKey) {
      return rsaAlgorithm((RSAKey) key);
    } else {
      return null;
    }
  }
}
