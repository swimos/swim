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

/**
 * Swim authenticator runtime.
 */
module swim.auth {
  requires transitive swim.security;
  requires transitive swim.io.http;
  requires transitive swim.kernel;

  exports swim.auth;

  provides swim.kernel.Kernel with swim.auth.AuthenticatorKernel;
}
