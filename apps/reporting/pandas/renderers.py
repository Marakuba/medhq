# -*- coding: utf-8 -*-


def choices_renderer(choices):
    """
        CHOICES: ( (0, 'value'), (1, 'value') .... )
    """
    d = dict(choices)

    def renderer(value):
        """
            value:    значение поля
            ctx:      целая строка данных

            из вышестоящей функции-декоратора передается словарь d.
            value будет одним из ключей данного словаря
        """

        return d[value]

    return renderer
