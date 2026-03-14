#include <node.h>
#include <v8.h>

using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Number;
using v8::Object;
using v8::String;
using v8::Value;
using v8::Context;

// Simple function that adds two numbers
void Add(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  
  // Get the two numbers from arguments
  double num1 = args[0].As<Number>()->Value();
  double num2 = args[1].As<Number>()->Value();
  
  // Calculate sum
  double sum = num1 + num2;
  
  // Return the result
  args.GetReturnValue().Set(Number::New(isolate, sum));
}

// Initialize the module
void Initialize(Local<Object> exports, Local<Value> module, void* priv) {
  NODE_SET_METHOD(exports, "add", Add);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)
