cmd_Release/obj.target/engine/engine.o := c++ -o Release/obj.target/engine/engine.o ../engine.cc '-DNODE_GYP_MODULE_NAME=engine' '-DUSING_UV_SHARED=1' '-DUSING_V8_SHARED=1' '-DV8_DEPRECATION_WARNINGS=1' '-D_GLIBCXX_USE_CXX11_ABI=1' '-D_FILE_OFFSET_BITS=64' '-D_DARWIN_USE_64_BIT_INODE=1' '-D_LARGEFILE_SOURCE' '-DBUILDING_NODE_EXTENSION' -I/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node -I/Users/angadsmac/Library/Caches/node-gyp/24.4.1/src -I/Users/angadsmac/Library/Caches/node-gyp/24.4.1/deps/openssl/config -I/Users/angadsmac/Library/Caches/node-gyp/24.4.1/deps/openssl/openssl/include -I/Users/angadsmac/Library/Caches/node-gyp/24.4.1/deps/uv/include -I/Users/angadsmac/Library/Caches/node-gyp/24.4.1/deps/zlib -I/Users/angadsmac/Library/Caches/node-gyp/24.4.1/deps/v8/include  -O3 -gdwarf-2 -fno-strict-aliasing -mmacosx-version-min=13.5 -arch arm64 -Wall -Wendif-labels -W -Wno-unused-parameter -std=gnu++20 -stdlib=libc++ -fno-rtti -fno-exceptions -MMD -MF ./Release/.deps/Release/obj.target/engine/engine.o.d.raw   -c
Release/obj.target/engine/engine.o: ../engine.cc \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/node.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/cppgc/common.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8config.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-array-buffer.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-local-handle.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-handle-base.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-internal.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-memory-span.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-object.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-maybe.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/cppgc/internal/conditional-stack-allocated.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/cppgc/macros.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/cppgc/internal/compiler-specific.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/cppgc/type-traits.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-persistent-handle.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-weak-callback-info.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-primitive.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-data.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-value.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-sandbox.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-traced-handle.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-platform.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-source-location.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-container.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-context.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-snapshot.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-isolate.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-callbacks.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-promise.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-debug.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-script.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-message.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-embedder-heap.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-exception.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-function-callback.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-microtask.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-statistics.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-unwinder.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-embedder-state-scope.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-date.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-extension.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-external.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-function.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-template.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-initialization.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-json.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-locker.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-microtask-queue.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-primitive-object.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-proxy.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-regexp.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-typed-array.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-value-serializer.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-version.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-wasm.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/node_version.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/node_api.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/js_native_api.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/js_native_api_types.h \
  /Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/node_api_types.h
../engine.cc:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/node.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/cppgc/common.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8config.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-array-buffer.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-local-handle.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-handle-base.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-internal.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-memory-span.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-object.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-maybe.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/cppgc/internal/conditional-stack-allocated.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/cppgc/macros.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/cppgc/internal/compiler-specific.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/cppgc/type-traits.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-persistent-handle.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-weak-callback-info.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-primitive.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-data.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-value.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-sandbox.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-traced-handle.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-platform.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-source-location.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-container.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-context.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-snapshot.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-isolate.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-callbacks.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-promise.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-debug.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-script.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-message.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-embedder-heap.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-exception.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-function-callback.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-microtask.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-statistics.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-unwinder.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-embedder-state-scope.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-date.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-extension.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-external.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-function.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-template.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-initialization.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-json.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-locker.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-microtask-queue.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-primitive-object.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-proxy.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-regexp.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-typed-array.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-value-serializer.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-version.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/v8-wasm.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/node_version.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/node_api.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/js_native_api.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/js_native_api_types.h:
/Users/angadsmac/Library/Caches/node-gyp/24.4.1/include/node/node_api_types.h:
