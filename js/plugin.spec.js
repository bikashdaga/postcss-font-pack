///<reference path='../typings/tsd.d.ts'/>
var chai = require('chai');
var plugin = require('./plugin');
var postcss = require('postcss');
var expect = chai.expect;
var PLUGIN_NAME = 'postcss-font-pack';
var ERROR_PREFIX = "[" + PLUGIN_NAME + "]";
// ReSharper disable WrongExpressionStatement
describe('postcss-font-pack plugin', function () {
    it('throws if configuration options are not provided', function () {
        var fn = function () {
            check(void (0), '');
        };
        expect(fn).to.throw("" + ERROR_PREFIX + " missing required configuration");
    });
    it('throws if packs option is not provided', function () {
        var fn = function () {
            check({}, '');
        };
        expect(fn).to.throw("" + ERROR_PREFIX + " missing required option: packs");
    });
    it('throws if packs option has no keys', function () {
        var fn = function () {
            check({ packs: {} }, '');
        };
        expect(fn).to.throw("" + ERROR_PREFIX + " packs option has no keys");
    });
    it('throws if a pack family is not specified', function () {
        var fn = function () {
            check({ packs: { a: { propGroups: [] } } }, '');
        };
        expect(fn).to.throw("" + ERROR_PREFIX + " missing required pack.family");
    });
    it('throws if a pack family is empty', function () {
        var fn = function () {
            check({ packs: { a: { family: [] } } }, '');
        };
        expect(fn).to.throw("" + ERROR_PREFIX + " pack.family is empty");
    });
    it('throws if prop value is null', function () {
        var fn = function () {
            check({
                packs: {
                    roboto: {
                        family: ['Roboto'],
                        propGroups: [
                            {
                                weight: null
                            }
                        ]
                    }
                }
            }, '');
        };
        expect(fn).to.throw(TypeError, "" + ERROR_PREFIX + " prop value expects string, number or array");
    });
    it('throws if font declaration is missing a size', function () {
        var fn = function () {
            check({
                packs: {
                    roboto: {
                        family: ['Roboto']
                    }
                }
            }, 'body{font:roboto}');
        };
        expect(fn).to.throw(/font property requires size and family/);
    });
    it('throws if font declaration is missing a family', function () {
        var fn = function () {
            check({
                packs: {
                    roboto: {
                        family: ['Roboto']
                    }
                }
            }, 'body{font:0}');
        };
        expect(fn).to.throw(/font property requires size and family/);
    });
    it('throws if no pack is found for font-family property', function () {
        var fn = function () {
            check({
                packs: {
                    roboto: {
                        family: ['Roboto']
                    }
                }
            }, 'body{font-family:foo}');
        };
        expect(fn).to.throw(/pack not found/);
    });
    it('throws if more than one pack is found', function () {
        var fn = function () {
            check({
                packs: {
                    roboto: {
                        family: ['Roboto'],
                        propGroups: [
                            {
                                weight: ['bold', 700]
                            },
                            {
                                weight: ['bold', 600]
                            }
                        ]
                    }
                }
            }, 'body{font:bold 0 roboto}');
        };
        expect(fn).to.throw("" + ERROR_PREFIX + " more than one pack found");
    });
    it('throws if fallbacks are provided', function () {
        var fn = function () {
            check({
                packs: {
                    roboto: {
                        family: ['Roboto', 'Arial', 'sans-serif']
                    }
                }
            }, 'body{font:0 roboto, Arial, sans-serif}');
        };
        expect(fn).to.throw(/pack not found/);
    });
    it('resolves a font-family declaration', function () {
        check({
            packs: {
                roboto: {
                    family: ['Roboto', 'Arial', 'sans-serif']
                }
            }
        }, 'body{font-family:roboto}', 'body{font-family:Roboto, Arial, sans-serif}');
    });
    it('resolves a font-weight declaration', function () {
        check({
            packs: {
                roboto: {
                    family: ['Roboto', 'Arial', 'sans-serif'],
                    propGroups: [
                        {
                            weight: 300
                        }
                    ]
                }
            }
        }, 'body{font-family:roboto;font-weight:300}', 'body{font-family:Roboto, Arial, sans-serif;font-weight:300}');
    });
    it('resolves a font-weight declaration with an alias', function () {
        check({
            packs: {
                roboto: {
                    family: ['Roboto', 'Arial', 'sans-serif'],
                    propGroups: [
                        {
                            weight: ['light', 300]
                        }
                    ]
                }
            }
        }, 'body{font-family:roboto;font-weight:light}', 'body{font-family:Roboto, Arial, sans-serif;font-weight:300}');
    });
    it('resolves a font-style declaration', function () {
        check({
            packs: {
                roboto: {
                    family: ['Roboto', 'Arial', 'sans-serif'],
                    propGroups: [
                        {
                            style: 'italic'
                        }
                    ]
                }
            }
        }, 'body{font-family:roboto;font-style:italic}', 'body{font-family:Roboto, Arial, sans-serif;font-style:italic}');
    });
    it('resolves a font-variant declaration', function () {
        check({
            packs: {
                roboto: {
                    family: ['Roboto', 'Arial', 'sans-serif'],
                    propGroups: [
                        {
                            variant: 'small-caps'
                        }
                    ]
                }
            }
        }, 'body{font-family:roboto;font-variant:small-caps}', 'body{font-family:Roboto, Arial, sans-serif;font-variant:small-caps}');
    });
    it('resolves a font-stretch declaration', function () {
        check({
            packs: {
                roboto: {
                    family: ['Roboto', 'Arial', 'sans-serif'],
                    propGroups: [
                        {
                            stretch: 'expanded'
                        }
                    ]
                }
            }
        }, 'body{font-family:roboto;font-stretch:expanded}', 'body{font-family:Roboto, Arial, sans-serif;font-stretch:expanded}');
    });
    it('resolves a font declaration (shorthand syntax)', function () {
        check({
            packs: {
                roboto: {
                    family: ['Roboto', 'Arial', 'sans-serif'],
                    propGroups: [
                        {
                            weight: ['light', 300],
                            style: 'italic',
                            variant: 'small-caps',
                            stretch: 'expanded'
                        }
                    ]
                }
            }
        }, 'body{font:light italic small-caps expanded 1rem/1.2 roboto}', 'body{font:300 italic small-caps expanded 1rem/1.2 Roboto, Arial, sans-serif}');
    });
    it('resolves an empty pack', function () {
        check({
            packs: {
                roboto: {
                    family: ['Roboto', 'Arial', 'sans-serif'],
                    propGroups: [
                        {},
                        {
                            style: 'italic'
                        }
                    ]
                }
            }
        }, 'body{font:1rem/1.2 roboto}', 'body{font:1rem/1.2 Roboto, Arial, sans-serif}');
    });
    it('throws if a font pack is not found', function () {
        var fn = function () {
            check({
                packs: {
                    roboto: {
                        family: ['Roboto', 'Arial', 'sans-serif'],
                        propGroups: [
                            {
                                style: 'italic'
                            }
                        ]
                    }
                }
            }, 'body{font:oblique 1rem/1.2 roboto}');
        };
        expect(fn).to.throw(/pack not found/);
    });
    it('throws if a font pack is only partially matched', function () {
        var fn = function () {
            check({
                packs: {
                    roboto: {
                        family: ['Roboto', 'Arial', 'sans-serif'],
                        propGroups: [
                            {
                                style: 'italic',
                                stretch: 'expanded'
                            }
                        ]
                    }
                }
            }, 'body{font:italic 1rem/1.2 roboto}');
        };
        expect(fn).to.throw("" + ERROR_PREFIX + " pack not found");
    });
    it('throws if only a font-size is provided', function () {
        var fn = function () {
            check({
                packs: {
                    roboto: {
                        family: ['Roboto', 'Arial', 'sans-serif']
                    }
                }
            }, 'body{font-size:0}');
        };
        expect(fn).to.throw("" + ERROR_PREFIX + " font-size missing required family");
    });
    it('remains silent for rules without font declarations', function () {
        check({
            packs: {
                roboto: {
                    family: ['Roboto', 'Arial', 'sans-serif']
                }
            }
        }, 'body{color:red}', 'body{color:red}');
    });
    describe('plugin options', function () {
        describe('requireSize: true', function () {
            it('throws if no font-size is specified', function () {
                var fn = function () {
                    check({
                        requireSize: true,
                        packs: {
                            roboto: {
                                family: ['Roboto', 'Arial', 'sans-serif']
                            }
                        }
                    }, 'body{font-family:roboto}');
                };
                expect(fn).to.throw("" + ERROR_PREFIX + " missing required font-size");
            });
            it('remains silent when both size and family are provided', function () {
                var options = {
                    requireSize: true,
                    packs: {
                        roboto: {
                            family: ['Roboto', 'Arial', 'sans-serif']
                        }
                    }
                };
                check(options, 'body{font-family:roboto;font-size:0}', 'body{font-family:Roboto, Arial, sans-serif;font-size:0}');
                check(options, 'body{font:1rem roboto}', 'body{font:1rem Roboto, Arial, sans-serif}');
            });
        });
    });
});
function check(options, input, output) {
    var processor = postcss([plugin(options)]);
    expect(processor.process(input).css).to.equal(output);
}
