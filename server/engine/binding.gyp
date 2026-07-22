{
  "targets": [
    {
      "target_name": "srs_engine",
      "sources": ["srs_engine.cpp"],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "cflags_cc": ["-std=c++17"],
      "xcode_settings": {
        "CLANG_CXX_LANGUAGE_STANDARD": "c++17",
        "GCC_ENABLE_CPP_EXCEPTIONS": "YES"
      },
      "defines": ["NAPI_CPP_EXCEPTIONS"]
    }
  ]
}
