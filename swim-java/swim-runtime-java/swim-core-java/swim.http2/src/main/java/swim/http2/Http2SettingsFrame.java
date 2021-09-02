// Copyright 2015-2021 Swim Inc.
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

package swim.http2;

import swim.codec.Debug;
import swim.codec.Encoder;
import swim.codec.Format;
import swim.codec.Output;
import swim.codec.OutputBuffer;
import swim.collections.FingerTrieSeq;
import swim.util.Murmur3;

public final class Http2SettingsFrame extends Http2Frame<Object> implements Debug {

  final int frameFlags;
  final int streamIdentifier;
  final FingerTrieSeq<Http2Setting> settings;

  Http2SettingsFrame(int frameFlags, int streamIdentifier, FingerTrieSeq<Http2Setting> settings) {
    this.frameFlags = frameFlags;
    this.streamIdentifier = streamIdentifier;
    this.settings = settings;
  }

  @Override
  public int frameType() {
    return 0x4;
  }

  @Override
  public int frameFlags() {
    return this.frameFlags;
  }

  public boolean ack() {
    return (this.frameFlags & Http2SettingsFrame.ACK_FLAG) != 0;
  }

  public Http2SettingsFrame ack(boolean ack) {
    final int frameFlags = ack
                         ? this.frameFlags | Http2SettingsFrame.ACK_FLAG
                         : this.frameFlags & ~Http2SettingsFrame.ACK_FLAG;
    return new Http2SettingsFrame(frameFlags, this.streamIdentifier, this.settings);
  }

  public int streamIdentifier() {
    return this.streamIdentifier;
  }

  public Http2SettingsFrame streamIdentifier(int streamIdentifier) {
    return new Http2SettingsFrame(this.frameFlags, streamIdentifier, this.settings);
  }

  public Http2Setting getSetting(int identifier) {
    final FingerTrieSeq<Http2Setting> settings = this.settings();
    for (int i = 0, n = settings.size(); i < n; i += 1) {
      final Http2Setting setting = settings.get(i);
      if (identifier == setting.identifier()) {
        return setting;
      }
    }
    return null;
  }

  public FingerTrieSeq<Http2Setting> settings() {
    return this.settings;
  }

  public Http2SettingsFrame settings(FingerTrieSeq<Http2Setting> settings) {
    return new Http2SettingsFrame(this.frameFlags, this.streamIdentifier, settings);
  }

  public Http2SettingsFrame settings(Http2Setting... settings) {
    return this.settings(FingerTrieSeq.of(settings));
  }

  public Http2SettingsFrame appendedSettings(FingerTrieSeq<Http2Setting> newSettings) {
    final FingerTrieSeq<Http2Setting> oldSettings = this.settings;
    final FingerTrieSeq<Http2Setting> settings = oldSettings.appended(newSettings);
    if (oldSettings != settings) {
      return new Http2SettingsFrame(this.frameFlags, this.streamIdentifier, settings);
    } else {
      return this;
    }
  }

  public Http2SettingsFrame appendedSettings(Http2Setting... newSettings) {
    return this.appendedSettings(FingerTrieSeq.of(newSettings));
  }

  public Http2SettingsFrame appendedSetting(Http2Setting newSetting) {
    final FingerTrieSeq<Http2Setting> oldSettings = this.settings;
    final FingerTrieSeq<Http2Setting> settings = oldSettings.appended(newSetting);
    if (oldSettings != settings) {
      return new Http2SettingsFrame(this.frameFlags, this.streamIdentifier, settings);
    } else {
      return this;
    }
  }

  @Override
  public Encoder<?, Http2SettingsFrame> http2Encoder(Http2Encoder http2) {
    return http2.settingsFrameEncoder(this);
  }

  @Override
  public Encoder<?, Http2SettingsFrame> encodeHttp2(OutputBuffer<?> output, Http2Encoder http2) {
    return http2.encodeSettingsFrame(output, this);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Http2SettingsFrame) {
      final Http2SettingsFrame that = (Http2SettingsFrame) other;
      return this.frameFlags == that.frameFlags && this.streamIdentifier == that.streamIdentifier
          && this.settings.equals(that.settings);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (Http2SettingsFrame.hashSeed == 0) {
      Http2SettingsFrame.hashSeed = Murmur3.seed(Http2SettingsFrame.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Http2SettingsFrame.hashSeed,
        this.frameFlags), this.streamIdentifier), this.settings.hashCode()));
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("Http2SettingsFrame").write('.').write("create").write('(')
                   .debug(this.streamIdentifier).write(')');
    if (this.frameFlags != 0) {
      output = output.write('.').write("frameFlags").write('(').debug(this.frameFlags).write(')');
    }
    if (this.ack()) {
      output = output.write('.').write("ack").write('(').write("true").write(')');
    }
    final FingerTrieSeq<Http2Setting> settings = this.settings;
    final int settingCount = settings.size();
    if (settingCount != 0) {
      output = output.write('.').write("settings").write('(').debug(settings.head());
      for (int i = 1; i < settingCount; i += 1) {
        output = output.write(", ").debug(settings.get(i));
      }
      output = output.write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  static final int ACK_FLAG = 0x01;

  public static Http2SettingsFrame create(int frameFlags, int streamIdentifier,
                                          FingerTrieSeq<Http2Setting> settings) {
    return new Http2SettingsFrame(frameFlags, streamIdentifier, settings);
  }

  public static Http2SettingsFrame create(FingerTrieSeq<Http2Setting> settings) {
    return new Http2SettingsFrame(0, 0, settings);
  }

  public static Http2SettingsFrame create(Http2Setting... settings) {
    return new Http2SettingsFrame(0, 0, FingerTrieSeq.of(settings));
  }

}
