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

export {UriException} from "./UriException";

export {
  AnyUri,
  UriInit,
  Uri,
} from "./Uri";

export {
  AnyUriScheme,
  UriScheme,
} from "./UriScheme";

export {
  AnyUriAuthority,
  UriAuthorityInit,
  UriAuthority,
} from "./UriAuthority";

export {
  AnyUriUser,
  UriUserInit,
  UriUser,
} from "./UriUser";

export {
  AnyUriHost,
  UriHost,
} from "./UriHost";
export {UriHostName} from "./UriHostName";
export {UriHostIPv4} from "./UriHostIPv4";
export {UriHostIPv6} from "./UriHostIPv6";
export {UriHostUndefined} from "./UriHostUndefined";

export {
  AnyUriPort,
  UriPort,
} from "./UriPort";

export {
  AnyUriPath,
  UriPath,
} from "./UriPath";
export {UriPathSegment} from "./UriPathSegment";
export {UriPathSlash} from "./UriPathSlash";
export {UriPathEmpty} from "./UriPathEmpty";
export {UriPathBuilder} from "./UriPathBuilder";
export {UriPathForm} from "./UriPathForm";

export {
  AnyUriQuery,
  UriQuery,
} from "./UriQuery";
export {UriQueryParam} from "./UriQueryParam";
export {UriQueryUndefined} from "./UriQueryUndefined";
export {UriQueryBuilder} from "./UriQueryBuilder";

export {
  AnyUriFragment,
  UriFragment,
} from "./UriFragment";

export {UriForm} from "./UriForm";

export {UriCache} from "./UriCache";

export * from "./parser";
