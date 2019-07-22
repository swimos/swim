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

package swim.cli;

import swim.api.ref.SwimRef;
import swim.api.warp.WarpDownlink;
import swim.args.Arg;
import swim.args.Cmd;
import swim.args.Opt;
import swim.uri.Uri;

public class CliClient {
  protected final SwimRef swim;

  public CliClient(SwimRef swim) {
    this.swim = swim;
  }

  public final SwimRef swim() {
    return this.swim;
  }

  public String name() {
    return "swim-cli";
  }

  public Cmd mainCmd() {
    return Cmd.of(name())
        .cmd(linkCmd())
        .cmd(syncCmd())
        .cmd(getCmd())
        .cmd(reflectCmd())
        .helpCmd();
  }

  public Cmd linkCmd() {
    return Cmd.of("link")
        .desc("stream changes to a lane of a remote node")
        .opt(Opt.of("host").flag('h').arg("hostUri").desc("remote host to link"))
        .opt(Opt.of("node").flag('n').arg("nodeUri").desc("remote node to link"))
        .opt(Opt.of("lane").flag('l').arg("laneUri").desc("lane to link"))
        .opt(Opt.of("format").flag('f').arg("json|recon").desc("event output format"))
        .helpCmd()
        .exec(this::runLinkCmd);
  }

  public Cmd syncCmd() {
    return Cmd.of("sync")
        .desc("stream the current state and changes to a lane of a remote node")
        .opt(Opt.of("host").flag('h').arg("hostUri").desc("remote host to link"))
        .opt(Opt.of("node").flag('n').arg("nodeUri").desc("remote node to link"))
        .opt(Opt.of("lane").flag('l').arg("laneUri").desc("lane to link"))
        .opt(Opt.of("format").flag('f').arg("json|recon").desc("event output format"))
        .helpCmd()
        .exec(this::runSyncCmd);
  }

  public Cmd getCmd() {
    return Cmd.of("get")
        .desc("fetch the current state of a lane of a remote node")
        .opt(Opt.of("host").flag('h').arg("hostUri").desc("remote host to link"))
        .opt(Opt.of("node").flag('n').arg("nodeUri").desc("remote node to link"))
        .opt(Opt.of("lane").flag('l').arg("laneUri").desc("lane to link"))
        .opt(Opt.of("format").flag('f').arg("json|recon").desc("event output format"))
        .helpCmd()
        .exec(this::runGetCmd);
  }

  public Cmd reflectCmd() {
    return Cmd.of("reflect")
        .desc("stream introspection metadata")
        .opt(Opt.of("edge").flag('e').arg("edgeUri").desc("endpoint to introspect"))
        .opt(Opt.of("mesh").flag('m').arg(Arg.of("meshUri").optional(true)).desc("introspect default or specified mesh"))
        .opt(Opt.of("part").flag('p').arg(Arg.of("partKey").optional(true)).desc("introspect default or specified partition"))
        .opt(Opt.of("host").flag('h').arg(Arg.of("hostUri").optional(true)).desc("introspect default or specified host"))
        .opt(Opt.of("node").flag('n').arg("nodeUri").desc("introspect specified node"))
        .opt(Opt.of("lane").flag('l').arg("laneUri").desc("introspect specified lane"))
        .opt(Opt.of("link").flag('k').desc("introspect link behavior"))
        .opt(Opt.of("router").flag('r').desc("introspect router behavior"))
        .opt(Opt.of("data").desc("introspect data behavior"))
        .opt(Opt.of("system").desc("introspect system behavior"))
        .opt(Opt.of("process").desc("introspect process behavior"))
        .opt(Opt.of("stats").flag('s').desc("stream introspection statistics"))
        .opt(Opt.of("format").flag('f').arg("json|recon").desc("event output format"))
        .cmd(reflectLogCmd())
        .helpCmd()
        .exec(this::runReflectCmd);
  }

  public Cmd reflectLogCmd() {
    return Cmd.of("log")
        .desc("stream log events")
        .opt(Opt.of("trace").flag('t').desc("stream trace log messages"))
        .opt(Opt.of("debug").flag('d').desc("stream debug log messages"))
        .opt(Opt.of("info").flag('i').desc("stream info log messages"))
        .opt(Opt.of("warn").flag('w').desc("stream warning log messages"))
        .opt(Opt.of("error").flag('e').desc("stream error log messages"))
        .helpCmd()
        .exec(this::runReflectLogCmd);
  }

  public void runLinkCmd(Cmd cmd) {
    final WarpDownlink downlink = downlink(cmd).keepSynced(false);
    final DownlinkLogger downlinkLogger = downlinkLogger(downlink, cmd);
    downlinkLogger.open();
  }

  public void runSyncCmd(Cmd cmd) {
    final WarpDownlink downlink = downlink(cmd).keepSynced(true);
    final DownlinkLogger downlinkLogger = downlinkLogger(downlink, cmd);
    downlinkLogger.open();
  }

  public void runGetCmd(Cmd cmd) {
    final WarpDownlink downlink = downlink(cmd).keepSynced(true);
    final DownlinkGetter downlinkGetter = downlinkGetter(downlink, cmd);
    downlinkGetter.open();
  }

  public void runReflectCmd(Cmd cmd) {
    final String edgeUri = cmd.getOpt("edge").getValue();
    if (edgeUri != null) {
      final String meshUri = cmd.getOpt("mesh").getValue();
      final String hostUri = cmd.getOpt("host").getValue();
      final String nodeUri = cmd.getOpt("node").getValue();
      final String laneUri = cmd.getOpt("lane").getValue();
      if (nodeUri != null) {
        Uri metaNodeUri;
        if (meshUri != null) {
          metaNodeUri = Uri.parse("swim:meta:mesh").appendedPath(meshUri, "node", nodeUri);
        } else if (hostUri != null) {
          metaNodeUri = Uri.parse("swim:meta:host").appendedPath(hostUri, "node", nodeUri);
        } else {
          metaNodeUri = Uri.parse("swim:meta:node").appendedPath(nodeUri);
        }
        if (laneUri != null) {
          metaNodeUri = metaNodeUri.appendedPath("lane", laneUri);
          final WarpDownlink downlink = this.swim.downlink()
              .hostUri(edgeUri)
              .nodeUri(metaNodeUri)
              .laneUri("linkStats")
              .keepSynced(true);
          final DownlinkLogger downlinkLogger = downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else {
          if (cmd.getOpt("link").isDefined()) {
            final WarpDownlink downlink = this.swim.downlink()
                .hostUri(edgeUri)
                .nodeUri(metaNodeUri)
                .laneUri("linkStats")
                .keepSynced(true);
            final DownlinkLogger downlinkLogger = downlinkLogger(downlink, cmd);
            downlinkLogger.open();
          } else {
            final WarpDownlink downlink = this.swim.downlink()
                .hostUri(edgeUri)
                .nodeUri(metaNodeUri)
                .laneUri("routerStats")
                .keepSynced(true);
            final DownlinkLogger downlinkLogger = downlinkLogger(downlink, cmd);
            downlinkLogger.open();
          }
        }
      } else if (hostUri != null) {
        Uri metaNodeUri;
        if (meshUri != null) {
          metaNodeUri = Uri.parse("swim:meta:mesh").appendedPath(meshUri);
          if (hostUri != null) {
            metaNodeUri = metaNodeUri.appendedPath("host", hostUri);
          }
        } else {
          metaNodeUri = Uri.parse("swim:meta:host");
          if (hostUri != null) {
            metaNodeUri = metaNodeUri.appendedPath(hostUri);
          }
        }
        if (cmd.getOpt("process").isDefined()) {
          final WarpDownlink downlink = this.swim.downlink()
              .hostUri(edgeUri)
              .nodeUri(metaNodeUri)
              .laneUri("processStats")
              .keepSynced(true);
          final DownlinkLogger downlinkLogger = downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else if (cmd.getOpt("system").isDefined()) {
          final WarpDownlink downlink = this.swim.downlink()
              .hostUri(edgeUri)
              .nodeUri(metaNodeUri)
              .laneUri("systemStats")
              .keepSynced(true);
          final DownlinkLogger downlinkLogger = downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else if (cmd.getOpt("data").isDefined()) {
          final WarpDownlink downlink = this.swim.downlink()
              .hostUri(edgeUri)
              .nodeUri(metaNodeUri)
              .laneUri("dataStats")
              .keepSynced(true);
          final DownlinkLogger downlinkLogger = downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else if (cmd.getOpt("router").isDefined()) {
          final WarpDownlink downlink = this.swim.downlink()
              .hostUri(edgeUri)
              .nodeUri(metaNodeUri)
              .laneUri("routerStats")
              .keepSynced(true);
          final DownlinkLogger downlinkLogger = downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else if (cmd.getOpt("link").isDefined()) {
          final WarpDownlink downlink = this.swim.downlink()
              .hostUri(edgeUri)
              .nodeUri(metaNodeUri)
              .laneUri("linkStats")
              .keepSynced(true);
          final DownlinkLogger downlinkLogger = downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else {
          final WarpDownlink downlink = this.swim.downlink()
              .hostUri(edgeUri)
              .nodeUri(metaNodeUri)
              .laneUri("hostStats")
              .keepSynced(true);
          final DownlinkLogger downlinkLogger = downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        }
      } else if (meshUri != null) {
        Uri metaNodeUri = Uri.parse("swim:meta:mesh");
        if (meshUri != null) {
          metaNodeUri = metaNodeUri.appendedPath(meshUri);
        }
        if (cmd.getOpt("process").isDefined()) {
          final WarpDownlink downlink = this.swim.downlink()
              .hostUri(edgeUri)
              .nodeUri(metaNodeUri)
              .laneUri("processStats")
              .keepSynced(true);
          final DownlinkLogger downlinkLogger = downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else if (cmd.getOpt("system").isDefined()) {
          final WarpDownlink downlink = this.swim.downlink()
              .hostUri(edgeUri)
              .nodeUri(metaNodeUri)
              .laneUri("systemStats")
              .keepSynced(true);
          final DownlinkLogger downlinkLogger = downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else if (cmd.getOpt("data").isDefined()) {
          final WarpDownlink downlink = this.swim.downlink()
              .hostUri(edgeUri)
              .nodeUri(metaNodeUri)
              .laneUri("dataStats")
              .keepSynced(true);
          final DownlinkLogger downlinkLogger = downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else if (cmd.getOpt("router").isDefined()) {
          final WarpDownlink downlink = this.swim.downlink()
              .hostUri(edgeUri)
              .nodeUri(metaNodeUri)
              .laneUri("routerStats")
              .keepSynced(true);
          final DownlinkLogger downlinkLogger = downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else if (cmd.getOpt("link").isDefined()) {
          final WarpDownlink downlink = this.swim.downlink()
              .hostUri(edgeUri)
              .nodeUri(metaNodeUri)
              .laneUri("linkStats")
              .keepSynced(true);
          final DownlinkLogger downlinkLogger = downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else {
          final WarpDownlink downlink = this.swim.downlink()
              .hostUri(edgeUri)
              .nodeUri(metaNodeUri)
              .laneUri("meshStats")
              .keepSynced(true);
          final DownlinkLogger downlinkLogger = downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        }
      } else {
        if (cmd.getOpt("process").isDefined()) {
          final WarpDownlink downlink = this.swim.downlink()
              .hostUri(edgeUri)
              .nodeUri("swim:meta:edge")
              .laneUri("processStats")
              .keepSynced(true);
          final DownlinkLogger downlinkLogger = downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else if (cmd.getOpt("system").isDefined()) {
          final WarpDownlink downlink = this.swim.downlink()
              .hostUri(edgeUri)
              .nodeUri("swim:meta:edge")
              .laneUri("systemStats")
              .keepSynced(true);
          final DownlinkLogger downlinkLogger = downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else if (cmd.getOpt("data").isDefined()) {
          final WarpDownlink downlink = this.swim.downlink()
              .hostUri(edgeUri)
              .nodeUri("swim:meta:edge")
              .laneUri("dataStats")
              .keepSynced(true);
          final DownlinkLogger downlinkLogger = downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else if (cmd.getOpt("link").isDefined()) {
          final WarpDownlink downlink = this.swim.downlink()
              .hostUri(edgeUri)
              .nodeUri("swim:meta:edge")
              .laneUri("linkStats")
              .keepSynced(true);
          final DownlinkLogger downlinkLogger = downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else {
          final WarpDownlink downlink = this.swim.downlink()
              .hostUri(edgeUri)
              .nodeUri("swim:meta:edge")
              .laneUri("routerStats")
              .keepSynced(true);
          final DownlinkLogger downlinkLogger = downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        }
      }
    }
  }

  public void runReflectLogCmd(Cmd cmd) {
    // TODO
  }

  protected WarpDownlink downlink(Cmd cmd) {
    return this.swim.downlink()
        .hostUri(cmd.getOpt("host").getValue())
        .nodeUri(cmd.getOpt("node").getValue())
        .laneUri(cmd.getOpt("lane").getValue());
  }

  protected DownlinkLogger downlinkLogger(WarpDownlink downlink, Cmd cmd) {
    final String format = cmd.getOpt("format").getValue();
    return new DownlinkLogger(downlink, format);
  }

  protected DownlinkGetter downlinkGetter(WarpDownlink downlink, Cmd cmd) {
    final String format = cmd.getOpt("format").getValue();
    return new DownlinkGetter(downlink, format);
  }
}
