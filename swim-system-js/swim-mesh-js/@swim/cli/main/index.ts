// Copyright 2015-2020 Swim inc.
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

import {Arg, Opt, Cmd} from "@swim/args";
import {Value} from "@swim/structure";
import {Recon} from "@swim/recon";
import {AnyUri, Uri} from "@swim/uri";
import * as client from "@swim/client";

function link(hostUri: AnyUri | null | undefined, nodeUri: AnyUri | null | undefined,
              laneUri: AnyUri | null | undefined, format?: string | null): client.Downlink {
  return client.downlink()
      .hostUri(hostUri)
      .nodeUri(nodeUri)
      .laneUri(laneUri)
      .keepSynced(true)
      .onEvent((body: Value) => {
        if (format === "json") {
          console.log(JSON.stringify(body.toAny()));
        } else {
          console.log(Recon.toString(body));
        }
      })
      .didUnlink((downlink: client.Downlink) => {
        downlink.close();
      });
}

function runLink(this: Cmd, args: {[name: string]: string | null | undefined}): void {
  link(args.host, args.node, args.lane, args.format).keepSynced(false).open();
}

function runSync(this: Cmd, args: {[name: string]: string | null | undefined}): void {
  link(args.host, args.node, args.lane, args.format).open();
}

function runGet(this: Cmd, args: {[name: string]: string | null | undefined}): void {
  link(args.host, args.node, args.lane, args.format)
      .didSync((downlink: client.Downlink) => {
        downlink.close();
      })
      .open();
}

function runReflect(this: Cmd, args: {[name: string]: string | null | undefined}): void {
  const edgeUri = args.edge;
  if (edgeUri) {
    const meshUri = args.mesh;
    const hostUri = args.host;
    const nodeUri = args.node;
    const laneUri = args.lane;
    if (nodeUri) {
      let metaNodeUri: Uri;
      if (meshUri) {
        metaNodeUri = Uri.parse("swim:meta:mesh").appendedPath(meshUri, "node", nodeUri);
      } else if (hostUri) {
        metaNodeUri = Uri.parse("swim:meta:host").appendedPath(hostUri, "node", nodeUri);
      } else {
        metaNodeUri = Uri.parse("swim:meta:node").appendedPath(nodeUri);
      }
      if (laneUri) {
        metaNodeUri = metaNodeUri.appendedPath("lane", laneUri);
        link(edgeUri, metaNodeUri, "linkStats", args.format).open();
      } else {
        if (args.link !== void 0) {
          link(edgeUri, metaNodeUri, "linkStats", args.format).open();
        } else {
          link(edgeUri, metaNodeUri, "routerStats", args.format).open();
        }
      }
    } else if (hostUri !== void 0) {
      let metaNodeUri: Uri;
      if (meshUri) {
        metaNodeUri = Uri.parse("swim:meta:mesh").appendedPath(meshUri);
        if (hostUri) {
          metaNodeUri = metaNodeUri.appendedPath("host", hostUri);
        }
      } else {
        metaNodeUri = Uri.parse("swim:meta:host");
        if (hostUri) {
          metaNodeUri = metaNodeUri.appendedPath(hostUri);
        }
      }
      if (args.process !== void 0) {
        link(edgeUri, metaNodeUri, "processStats", args.format).open();
      } else if (args.system !== void 0) {
        link(edgeUri, metaNodeUri, "systemStats", args.format).open();
      } else if (args.data !== void 0) {
        link(edgeUri, metaNodeUri, "dataStats", args.format).open();
      } else if (args.router !== void 0) {
        link(edgeUri, metaNodeUri, "routerStats", args.format).open();
      } else if (args.link !== void 0) {
        link(edgeUri, metaNodeUri, "linkStats", args.format).open();
      } else {
        link(edgeUri, metaNodeUri, "hostStats", args.format).open();
      }
    } else if (meshUri !== void 0) {
      let metaNodeUri = Uri.parse("swim:meta:mesh");
      if (meshUri) {
        metaNodeUri = metaNodeUri.appendedPath(meshUri);
      }
      if (args.process !== void 0) {
        link(edgeUri, metaNodeUri, "processStats", args.format).open();
      } else if (args.system !== void 0) {
        link(edgeUri, metaNodeUri, "systemStats", args.format).open();
      } else if (args.data !== void 0) {
        link(edgeUri, metaNodeUri, "dataStats", args.format).open();
      } else if (args.router !== void 0) {
        link(edgeUri, metaNodeUri, "routerStats", args.format).open();
      } else if (args.link !== void 0) {
        link(edgeUri, metaNodeUri, "linkStats", args.format).open();
      } else {
        link(edgeUri, metaNodeUri, "meshStats", args.format).open();
      }
    } else {
      if (args.process !== void 0) {
        link(edgeUri, "swim:meta:edge", "processStats", args.format).open();
      } else if (args.system !== void 0) {
        link(edgeUri, "swim:meta:edge", "systemStats", args.format).open();
      } else if (args.data !== void 0) {
        link(edgeUri, "swim:meta:edge", "dataStats", args.format).open();
      } else if (args.link !== void 0) {
        link(edgeUri, "swim:meta:edge", "linkStats", args.format).open();
      } else {
        link(edgeUri, "swim:meta:edge", "routerStats", args.format).open();
      }
    }
  }
}

function runReflectLog(this: Cmd, args: {[name: string]: string | null | undefined}): void {
  // TODO
}

const linkCmd = Cmd.of("link")
    .desc("stream changes to a lane of a remote node")
    .opt(Opt.of("host").flag("h").arg("hostUri").desc("remote host to link"))
    .opt(Opt.of("node").flag("n").arg("nodeUri").desc("remote node to link"))
    .opt(Opt.of("lane").flag("l").arg("laneUri").desc("lane to link"))
    .opt(Opt.of("format").flag("f").arg("json|recon").desc("event output format"))
    .helpCmd()
    .exec(runLink);

const syncCmd = Cmd.of("sync")
    .desc("stream the current state and changes to a lane of a remote node")
    .opt(Opt.of("host").flag("h").arg("hostUri").desc("remote host to link"))
    .opt(Opt.of("node").flag("n").arg("nodeUri").desc("remote node to link"))
    .opt(Opt.of("lane").flag("l").arg("laneUri").desc("lane to link"))
    .opt(Opt.of("format").flag("f").arg("json|recon").desc("event output format"))
    .helpCmd()
    .exec(runSync);

const getCmd = Cmd.of("get")
    .desc("fetch the current state of a lane of a remote node")
    .opt(Opt.of("host").flag("h").arg("hostUri").desc("remote host to link"))
    .opt(Opt.of("node").flag("n").arg("nodeUri").desc("remote node to link"))
    .opt(Opt.of("lane").flag("l").arg("laneUri").desc("lane to link"))
    .opt(Opt.of("format").flag("f").arg("json|recon").desc("event output format"))
    .helpCmd()
    .exec(runGet);

const reflectLogCmd = Cmd.of("log")
    .desc("stream log events")
    .opt(Opt.of("trace").flag("t").desc("stream trace log messages"))
    .opt(Opt.of("debug").flag("d").desc("stream debug log messages"))
    .opt(Opt.of("info").flag("i").desc("stream info log messages"))
    .opt(Opt.of("warn").flag("w").desc("stream warning log messages"))
    .opt(Opt.of("error").flag("e").desc("stream error log messages"))
    .helpCmd()
    .exec(runReflectLog);

const reflectCmd = Cmd.of("reflect")
    .desc("stream introspection metadata")
    .opt(Opt.of("edge").flag("e").arg("edgeUri").desc("endpoint to introspect"))
    .opt(Opt.of("mesh").flag("m").arg(Arg.of("meshUri").optional(true)).desc("introspect default or specified mesh"))
    .opt(Opt.of("part").flag("p").arg(Arg.of("partKey").optional(true)).desc("introspect default or specified partition"))
    .opt(Opt.of("host").flag("h").arg(Arg.of("hostUri").optional(true)).desc("introspect default or specified host"))
    .opt(Opt.of("node").flag("n").arg("nodeUri").desc("introspect specified node"))
    .opt(Opt.of("lane").flag("l").arg("laneUri").desc("introspect specified lane"))
    .opt(Opt.of("link").flag("k").desc("introspect link behavior"))
    .opt(Opt.of("router").flag("r").desc("introspect router behavior"))
    .opt(Opt.of("data").desc("introspect data behavior"))
    .opt(Opt.of("system").desc("introspect system behavior"))
    .opt(Opt.of("process").desc("introspect process behavior"))
    .opt(Opt.of("stats").flag("s").desc("stream introspection statistics"))
    .opt(Opt.of("format").flag("f").arg("json|recon").desc("event output format"))
    .cmd(reflectLogCmd)
    .helpCmd()
    .exec(runReflect);

const cmd = Cmd.of("swim-cli")
    .cmd(linkCmd)
    .cmd(syncCmd)
    .cmd(getCmd)
    .cmd(reflectCmd)
    .helpCmd();

cmd.parse().run();
