{
  "targets": [
    {
      "target_name": "louvain",
      "include_dirs": [
        "<!(node -e \"require('nan')\")",
        "./native/headers"
      ],
      "sources": [
        "./native/headers/random.h",
        "./native/headers/community-graph.h",
        "./native/v8/louvain.cc",
        "./native/v8/index.cc",
      ],
      'cflags' : [ '-std=c++11' ],
      'conditions': [
        [ 'OS=="mac"', {
          'xcode_settings': {
            'OTHER_CPLUSPLUSFLAGS' : [ '-std=c++11', '-stdlib=libc++' ],
            'MACOSX_DEPLOYMENT_TARGET': '10.7',
            'GCC_ENABLE_CPP_EXCEPTIONS': 'YES', # make sure we support exceptions
          },
        }],
      ],
    }
  ]
}
