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

package swim.runtime;

import swim.runtime.http.HttpErrorUplinkModem;
import swim.runtime.warp.WarpErrorUplinkModem;
import swim.structure.Record;
import swim.structure.Value;

public final class UplinkError {
  private UplinkError() {
    // static
  }

  static void rejectWarp(WarpBinding link, Value body) {
    final WarpErrorUplinkModem linkContext = new WarpErrorUplinkModem(link, body);
    link.setLinkContext(linkContext);
    linkContext.cueDown();
  }

  static void rejectHttp(HttpBinding link) {
    final HttpErrorUplinkModem linkContext = new HttpErrorUplinkModem(link);
    link.setLinkContext(linkContext);
  }

  public static void rejectMeshNotFound(LinkBinding link) {
    if (link instanceof WarpBinding) {
      rejectWarp((WarpBinding) link, Record.create(1).attr("meshNotFound"));
    } else if (link instanceof HttpBinding) {
      rejectHttp((HttpBinding) link);
    } else {
      throw new AssertionError();
    }
  }

  public static void rejectPartNotFound(LinkBinding link) {
    if (link instanceof WarpBinding) {
      rejectWarp((WarpBinding) link, Record.create(1).attr("partNotFound"));
    } else if (link instanceof HttpBinding) {
      rejectHttp((HttpBinding) link);
    } else {
      throw new AssertionError();
    }
  }

  public static void rejectHostNotFound(LinkBinding link) {
    if (link instanceof WarpBinding) {
      rejectWarp((WarpBinding) link, Record.create(1).attr("hostNotFound"));
    } else if (link instanceof HttpBinding) {
      rejectHttp((HttpBinding) link);
    } else {
      throw new AssertionError();
    }
  }

  public static void rejectNodeNotFound(LinkBinding link) {
    if (link instanceof WarpBinding) {
      rejectWarp((WarpBinding) link, Record.create(1).attr("nodeNotFound"));
    } else if (link instanceof HttpBinding) {
      rejectHttp((HttpBinding) link);
    } else {
      throw new AssertionError();
    }
  }

  public static void rejectLaneNotFound(LinkBinding link) {
    if (link instanceof WarpBinding) {
      rejectWarp((WarpBinding) link, Record.create(1).attr("laneNotFound"));
    } else if (link instanceof HttpBinding) {
      rejectHttp((HttpBinding) link);
    } else {
      throw new AssertionError();
    }
  }

  public static void rejectUnsupported(LinkBinding link) {
    if (link instanceof WarpBinding) {
      rejectWarp((WarpBinding) link, Record.create(1).attr("unsupported"));
    } else if (link instanceof HttpBinding) {
      rejectHttp((HttpBinding) link);
    } else {
      throw new AssertionError();
    }
  }
}
