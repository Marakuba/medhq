# -*- coding: utf-8 -*-

from django.template import Library, Node, TemplateSyntaxError

register = Library()



def zid(value, num):
    return str(value).zfill(int(num)) 

register.filter("zid", zid)

class RangeNode(Node):
    def __init__(self, num, context_name):
        self.num, self.context_name = num, context_name
    def render(self, context):
        if not isinstance(self.num, int):
            print context
            model, attr = self.num.split('.')
            obj = getattr(context,model)
            self.num = getattr(obj, attr)
        #self.num = getattr(context,self.num,self.num)
        context[self.context_name] = range(int(self.num))
        return ""
        
@register.tag
def num_range(parser, token):
    """
    Takes a number and iterates and returns a range (list) that can be 
    iterated through in templates
    
    Syntax:
    {% num_range 5 as some_range %}
    
    {% for i in some_range %}
      {{ i }}: Something I want to repeat\n
    {% endfor %}
    
    Produces:
    0: Something I want to repeat 
    1: Something I want to repeat 
    2: Something I want to repeat 
    3: Something I want to repeat 
    4: Something I want to repeat
    """
    try:
        fnctn, num, trash, context_name = token.split_contents()
    except ValueError:
        raise TemplateSyntaxError, "%s takes the syntax %s number_to_iterate\
            as context_variable" 
    if not trash == 'as':
        raise TemplateSyntaxError, "%s takes the syntax %s number_to_iterate\
            as context_variable" 
    return RangeNode(num, context_name)






class MKRangeNode(Node):
    def __init__(self, parser, range_args, context_name):
        self.template_parser = parser
        self.range_args = range_args
        self.context_name = context_name

    def render(self, context):

        resolved_ranges = []
        for arg in self.range_args:
            compiled_arg = self.template_parser.compile_filter(arg)
            resolved_ranges.append(compiled_arg.resolve(context, ignore_failures=True))
        context[self.context_name] = range(*resolved_ranges)
        return ""
        
@register.tag
def mkrange(parser, token):
    """
    Accepts the same arguments as the 'range' builtin and creates
    a list containing the result of 'range'.
    
    Syntax:
        {% mkrange [start,] stop[, step] as context_name %}

    For example:
        {% mkrange 5 10 2 as some_range %}
        {% for i in some_range %}
          {{ i }}: Something I want to repeat\n
        {% endfor %}
    
    Produces:
        5: Something I want to repeat 
        7: Something I want to repeat 
        9: Something I want to repeat 
    """

    tokens = token.split_contents()
    fnctl = tokens.pop(0)

    def error():
        raise TemplateSyntaxError, "%s accepts the syntax: {%% %s [start,] " +\
                "stop[, step] as context_name %%}, where 'start', 'stop' " +\
                "and 'step' must all be integers." %(fnctl, fnctl)

    range_args = []
    while True:
        if len(tokens) < 2:
            error()

        token = tokens.pop(0)

        if token == "as":
            break

        range_args.append(token)
    
    if len(tokens) != 1:
        error()

    context_name = tokens.pop()

    return MKRangeNode(parser, range_args, context_name)