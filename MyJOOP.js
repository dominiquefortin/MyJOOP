(function _Package_MyJOOP_ (global) {

  /* ********************************************
filename: MyJOOP.js version 1.0
Copyright 2015 Dominique Fortin

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
   *
   *  Caracteristic of MyJOOP (my Javascript Object Oriented Programming)
   *
   *  - No method overloading.
   *  - Single inheritence.
   *  - All protected properties and methods must be prefixed with "P$." to be
   *    used (ex. this.P$.a_property). The protected space is seperate from the
   *    public and private space (i.e. you can have two different property, one
   *    in the public space and one in the protected space, with the same name,
   *    but it is not recommended).
   *  - Private properties and methods hide public ones, but not protected ones.
   *    All private properties and methods are shared within one class level.  If
   *    you do "this.a_property_not_defined = ({some_expression});" and
   *    "a_property_not_defined" was not defined in any definition (public,
   *    protected or private), it will be added as a pravate properties that only
   *    exists in this instance of the class.
   *  - It is possible access only public properties and methods by prefixing
   *    with "public." (ex. this.public.a_property).
   *  - Virtal methods name must be prefixed "$" in the definition. You acces a
   *    virtual version of the method by not prefixing with "$" (ex.
   *    this.a_virtual_method(); ). To acces the original method use the "$"
   *    prefix (ex. this.$a_virtual_method(); ).
   *  - Lower level class properties and methods can be accessed with the
   *    prefix "$uper.".
   *  - Lower level static class properties and methods can be accessed with the
   *    prefix "$uperClass.".
   *  - Base class constructor is called before the current level class
   *    constructor,like in C++. The creation of an object is done calling the
   *    constructor functon after the new function (ex. var o =
   *    (new myClass(param1 , param2 , ...)).constructor(); )
   *
   *  - Example of class creation:* /

        var A = Object.extend("A",
          {"static" :
            {"counter_start" : 5 // all static propertiers and methods should
                                 // be initialized
            ,"get_counter" : function () {
                var cnt = this.counter_start;
                this.get_counter = function () { return ++cnt; };
                return cnt;
              }
            }
          ,"public" :
            {"a_public_property_of_A" : ("This value does not matter. It will be"
               +"initialize with undefined before the constructon is called.")

            ,"constructor" : function (a, other) { this.id(A.get_counter()); this.a_public_property_of_A(a); }

            ,"$virtual_method" : function () { return this.a_public_property_of_A(); }
            ,"print" : function () { console.log("The value is "+this.virtual_method()); }
            }
//        ,"protected" : {}
          ,"private" :
            {"id" : "does not matter" }
          });

         var B = A.extend("B",
          {//"static" : {},
           "public" :
            {"base_constructor_arguments" :
              function () { var arg_A = [arguments[0], "other"]; return arg_A; }
            ,"constructor" : function (b) {}
            ,"$virtual_method" : function () { return this.a_public_property_of_A() * 100; }
            }
//        ,"protected" : {}
//        ,"private" : {}
          });
   *
   *  - Example of object instanciation:

        var a = (new A(3)).constructor();
        a.print();
        var b = (new B(5)).constructor();
        b.print();
        b.$uper.print();
        var old_val = b.a_public_property_of_A();     // getting a property
        var new_val = b.a_public_property_of_A(1000); // setting a property
        console.log("the old value is "+old_val);
        console.log("the new value is "+new_val);

   *************************************************************************/

  if (global.Object.extend) {
    if (typeof console !== 'undefined' && typeof console.warn === 'function') {
        console.warn('The function extend is already defined in the Object class. '
           +'This framework is going to overwrite it.');
    }
  }

  var local_context = this;

  function _extend_class(Base_class, new_class_name, new_class_definitions) {

    if (typeof Base_class !== 'function') throw "The base class must be a function.";
    if (typeof new_class_definitions !== 'object') throw "The new class definition must be an object.";
    if (new_class_definitions.public
        && typeof new_class_definitions.public !== 'object') throw "The new class public definition must an object.";
    if (new_class_definitions.protected
        && typeof new_class_definitions.protected !== 'object') throw "The new class protected definition must an object.";
    if (new_class_definitions.private
        && typeof new_class_definitions.private !== 'object') throw "The new class private definition must an object.";
    if (new_class_definitions.static
        && typeof new_class_definitions.static !== 'object') throw "The new class static definition must an object.";

    var _New_class = function _class () {
        var args = Array.prototype.slice.call(arguments, 0);
        this.constructor = function _const_ () {
            var contx = _initialize.call(_New_class.prototype, args);
            return contx.public;
          };
      };

    _New_class.class_name = new_class_name;
    _add_extend(_New_class);

    if (new_class_definitions.static) {
      _transfer_static_properties.call(_New_class, new_class_definitions.static);
    }

    _New_class.prototype = Object.create(Base_class.prototype);
    _New_class.prototype.constructor = _New_class;
    _New_class.prototype.$uperClass = Base_class.prototype;
    _New_class.prototype.public = new_class_definitions.public || {};
    _New_class.prototype.protected = new_class_definitions.protected || {};
    _New_class.prototype.private = new_class_definitions.private || {};

    if (_New_class.prototype.public.hasOwnProperty('toString') {
      _New_class.prototype.public['$toString'] = _New_class.prototype.public['toString']
      delete _New_class.prototype.public.toString;
    } else if (!_New_class.prototype.public.hasOwnProperty('$toString')) {
      _New_class.prototype.public['$toString'] = function(){
          return "[object "+new_class_name+"]";
        };
    }

    return _New_class;
  }

  function _initialize(args, to_clone) {

    if (this === global.Object.prototype) {
      return {"base": undefined
             ,"public": global.Object.prototype
             ,"state": {"P$": global.Object.prototype} };
    }

    var local_class = this.constructor;
    var local_proto = this;
    var contx = {};

    var base_args = [];
    if (this.public.base_constructor_arguments) {
      if (typeof this.public.base_constructor_arguments !== "function")
        throw "The base_constructor_arguments must be a function.";

      base_args = this.public.base_constructor_arguments.apply({}, args || []);

      if (! (typeof base_args === "object" && base_args instanceof Array))
        throw "The base_constructor_arguments function must returned an Array.";
    }

    contx.base = _initialize.call(this.$uperClass, base_args, (to_clone ? to_clone.base : undefined));

    contx.public   = global.Object.create(contx.base.public);
    contx.state    = global.Object.create(contx.public);
    contx.state.P$ = global.Object.create(contx.base.state.P$);

    contx.public.$uper   = contx.base.public;
    contx.state.public   = contx.public;
    contx.state.P$.$uper = contx.base.state.P$;

    _set_ref();

    _create_class_members.call(contx.public,   this.public,    contx.state);
    _create_class_members.call(contx.state,    this.private,   contx.state);
    _create_class_members.call(contx.state.P$, this.protected, contx.state);

    var vmethods = {};
    var P$_vmethods = {};

    if (local_proto.$uperClass.hasOwnProperty(vmethods))
      vmethods    = local_proto.$uper.vmethods;
    if (local_proto.$uperClass.hasOwnProperty(P$_vmethods))
      P$_vmethods = local_proto.$uper.P$_vmethods;

    local_proto.vmethods    = _correct_virtual_methods(vmethods,    contx.public);
    local_proto.P$_vmethods = _correct_virtual_methods(P$_vmethods, contx.state.P$);

    _percolate_virtual_methods({}, contx.public);
    _percolate_virtual_methods({}, contx.state.P$);

    if (to_clone) {
      _overwrite_properties(contx.public,   to_clone.public);
      _overwrite_properties(contx.state,    to_clone.state);
      _overwrite_properties(contx.state.P$, to_clone.state.P$);
    }

    contx.public.instance_of = function _instance_of_ (_class) {
        return (local_class === _class)
          || (contx.base.public.instance_of
              && contx.base.public.instance_of(_class))
          || false;
      };

    contx.public.cast_to = function _cast_to_ (_class) {
        if (local_class === _class)
          return contx.public;
        if (contx.base.public.cast_to)
          return contx.base.public.cast_to(_class);
        return null;
      };

    contx.public.dynamic_cast = function _dynamic_cast_ (_class) {
        var c = contx.public.cast_to(_class);
        if (c === null) c = contx.ref.cast_to(_class);
        return c;
      };

    contx.public.type_info_name = function _type_info_name_ () {
        return local_class.class_name;
      };

    contx.public.clone = function _clone_ () {
        var local_contx = _initialize.call(local_proto, undefined, contx);
        return local_contx.public;
      };

    if (this.public
       && this.public.hasOwnProperty("constructor")
       && !to_clone) {

      this.public.constructor.apply(contx.state, (args || []));
    }

    return contx;

    function _set_ref() {
      var ctx = contx;
      while (ctx.base) {
        ctx.ref = contx.public;
        ctx = ctx.base;
      }
    }
  }

  function _correct_virtual_methods (vmethods_list, obj) {
    var my_list = {};
    for (var vmn in vmethods_list) {
      if (vmethods_list.hasOwnProperty(vmn)) {
        my_list[vmn] = undefined;
        if (obj.hasOwnProperty(vmn)) {
          if (typeof obj[vmn] !== 'function') throw vmn+" must be function.";
          if (obj.hasOwnProperty('$'+vmn)) throw "Too many definition for "+vmn;
          obj['$'+vmn] = obj[vmn];
          obj[vmn] = undefined;
        }
      }
    }
    for (var pn in obj) {
      if (obj.hasOwnProperty(pn) && typeof obj[pn] === 'function'
         && pn.charAt('0') === '$') {
        var vmethode_name = pn.substr(1);
        if (obj.hasOwnProperty(vmethode_name)) throw "Too many definition for "+vmethode_name;
        if (!vmethods_list.hasOwnProperty(vmethode_name)) {
          vmethods_list[vmethode_name] = undefined;
        }
      }
    }
    return my_list;
  }

  function _percolate_virtual_methods (vmethods, obj) {
    if (obj === global.Object.prototype) {
      return;
    }
    for (var pn in obj) {
      if (typeof obj[pn] === 'function' && pn.charAt('0') === '$') {
        var vmethode_name = pn.substr(1);
        if (!vmethods.hasOwnProperty(vmethode_name)) {
          vmethods[vmethode_name] = obj[pn];
        }
      }
    }
    for (var mn in vmethods) {
      if (obj.hasOwnProperty('$'+mn)) {
        obj[mn] = vmethods[mn];
      }
    }
    _percolate_virtual_methods(vmethods, obj.$uper);
  }

  function _is_keyword(name) {
    return name === "constructor" || name === "base_constructor_arguments"
        || name === "private" || name === "public"
        || name === "P$" || name === "protected"
        || name === "instance_of" || name === "cast_to"
        || name === "clone" || name === "extend"
        || name === '$uperClass' || name === "$uper";
  }

  function _create_class_members(definition, state) {
    for (var pn in definition) {
      if (definition.hasOwnProperty(pn) && !_is_keyword(pn)) {
        var prop = definition[pn];
        if (typeof prop === "function") {
          this[pn] = _bind_method(prop, state);
        } else {
          if (pn.charAt(0) === "$")
            throw 'The '+pn+' property name connot start with an "$".'
          this[pn] = (function () {
             var mem;
             return function _property_accessor_ () {
                 if (arguments.length >= 1) {
                   mem = arguments[0];
                 }
                 if (global.hasOwnProperty('_Package_MyJOOP_debug_')) {
                   this.debug[pn] = mem;
                 } else if (this.hasOwnProperty('debug')) {
                   delete this.debug;
                 }
                 return mem;
               };
            })();
        }
      }
    }
  }

  function _transfer_static_properties(definition) {
    for (var pn in definition) {
      if (definition.hasOwnProperty(pn) && !_is_keyword(pn)
          && !this.hasOwnProperty(pn)) {
        this[pn] = definition[pn];
        definition[pn] = undefined;
        delete definition.pn;
      }
    }
  }

  function _bind_method(method, state, args) {
    return function () {
        var args2 = Array.prototype.slice.call((args || arguments), 0);
        return method.apply(state, args2);
      };
  }

  function _overwrite_properties(dest, sour) {
    for (var pn in sour) {
      if (sour.hasOwnProperty(pn) && !_is_keyword(pn)) {
        if (typeof sour !== "function") {
          dest[pn] = sour[pn];
        }
      }
    }
  }

  function _add_extend (_class) {
    _class.extend = function () {
      var args = _bind_method(Array.prototype.slice, arguments)(0);
      args.unshift(_class);
      return _extend_class.apply(local_context, args);
    };
  }

  _add_extend(global.Object);

})(window);
