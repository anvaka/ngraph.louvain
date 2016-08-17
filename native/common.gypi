{
  'target_defaults': {
    'cflags' : [ '-std=c++11' ],
    'target_conditions': [
      ['_type=="executable"', {
          'xcode_settings': {
            'OTHER_LDFLAGS': [ '-stdlib=libc++' ],
          },
        }
      ],
    ],
    'conditions': [
        [ 'OS=="mac"', {
          'xcode_settings': {
            'OTHER_CPLUSPLUSFLAGS' : [ '-std=c++11', '-stdlib=libc++' ],
            'MACOSX_DEPLOYMENT_TARGET': '10.7',
            'GCC_ENABLE_CPP_EXCEPTIONS': 'YES', # make sure we support exceptions
          },
        }],
      ],
  },
}
