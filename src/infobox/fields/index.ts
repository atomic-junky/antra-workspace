import type { Component } from 'svelte';
import type { FieldProps } from './types';
import InputField from './InputField.svelte';
import ListField from './ListField.svelte';
import CheckboxField from './CheckboxField.svelte';
import NoteField from './NoteField.svelte';

export const FIELD_COMPONENTS: Record<string, Component<FieldProps>> = {
    text: InputField,
    number: InputField,
    date: InputField,
    datetime: InputField,
    list: ListField,
    checkbox: CheckboxField,
    note: NoteField,
};