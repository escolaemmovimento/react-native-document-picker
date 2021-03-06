'use strict';
import { Platform, NativeModules } from 'react-native';
const { RNDocumentPicker } = NativeModules;

if (!RNDocumentPicker) {
  // Use a timeout to ensure the warning is displayed in the YellowBox
  setTimeout(() => {
    console.warn(
      'RNDocumentPicker: Native module is not available, make sure you have finished the installation process and rebuilt your app'
    );
  }, 0);
} else if (!RNDocumentPicker.pick && RNDocumentPicker.show) {
  // Use a timeout to ensure the warning is displayed in the YellowBox
  setTimeout(() => {
    console.warn(
      'RNDocumentPicker: Native module is obsolete, you may not have rebuilt your app after upgrading the library'
    );
  }, 0);
}

const E_DOCUMENT_PICKER_CANCELED = 'DOCUMENT_PICKER_CANCELED';

function pick(opts) {
  if ('filetype' in opts) {
    throw new TypeError(
      'A `filetype` option was passed to DocumentPicker.pick, the correct option is `type`'
    );
  }
  if ('types' in opts) {
    throw new TypeError(
      'A `types` option was passed to DocumentPicker.pick, the correct option is `type`'
    );
  }

  if (!('type' in opts)) {
    opts.type = DocumentPicker.types.allFiles;
  }

  opts.type = Array.isArray(opts.type) ? opts.type : [opts.type];

  if (opts.type.some((type) => type === undefined)) {
    throw new TypeError(
      'Unexpected undefined type option, did you try using a DocumentPicker.types.* that does not exist?'
    );
  }

  if (Array.isArray(opts.type) && opts.type.length < 1) {
    throw new TypeError(
      '`type` option should not be an empty array, at least one type must be passed if the `type` option is not omitted'
    );
  }

  opts.type.forEach((type) => {
    if (typeof type !== 'string') {
      throw new TypeError('Invalid type option, expected a string not: ' + type);
    }
  });

  if (opts.type.length > 1 && Platform.OS === 'android' && Platform.Version < 19) {
    console.warn(
      `RNDocumentPicker: Android API level ${Platform.Version} does not support multiple types, falling back to */*`
    );
  }

  if ('copyTo' in opts && !['cachesDirectory', 'documentDirectory'].includes(opts.copyTo)) {
    throw new TypeError('Invalid copyTo option: ' + opts.copyTo);
  }

  return RNDocumentPicker.pick(opts);
}

const Types = {
  mimeTypes: {
    allFiles: '*/*',
    audio: 'audio/*',
    csv: 'text/csv',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    excel: 'application/vnd.ms-excel',
    excelx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    images: 'image/*',
    pdf: 'application/pdf',
    plainText: 'text/plain',
    powerpoint: 'application/vnd.ms-powerpoint',
    powerpointx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    video: 'video/*',
    zip: 'application/zip',
  },
  utis: {
    allFiles: 'public.content',
    audio: 'public.audio',
    csv: 'public.comma-separated-values-text',
    doc: 'com.microsoft.word.doc',
    docx: 'org.openxmlformats.wordprocessingml.document',
    excel: 'com.microsoft.excel.xls',
    excelx: 'org.openxmlformats.spreadsheetml.sheet',
    images: 'public.image',
    pdf: 'com.adobe.pdf',
    plainText: 'public.plain-text',
    powerpoint: 'com.microsoft.powerpoint.ppt',
    powerpointx: 'org.openxmlformats.presentationml.presentation',
    video: 'public.movie',
    zip: 'public.zip-archive',
  },
  extensions: {
    allFiles: '*',
    audio:
      '.3g2 .3gp .aac .adt .adts .aif .aifc .aiff .asf .au .m3u .m4a .m4b .mid .midi .mp2 .mp3 .mp4 .rmi .snd .wav .wax .wma',
    csv: '.csv',
    doc: '.doc',
    docx: '.docx',
    excel: '.xls',
    excelx: '.xlsx',
    images: '.jpeg .jpg .png',
    pdf: '.pdf',
    plainText: '.txt',
    powerpoint: '.ppt',
    powerpointx: '.pptx',
    video: '.mp4',
    zip: '.zip .gz',
  },
};

const PlatformTypes = {
  android: Types.mimeTypes,
  ios: Types.utis,
  windows: Types.extensions,
};

export default class DocumentPicker {
  /**
   * Android requires mime types, iOS is a bit more complicated:
   *
   * @see https://developer.apple.com/library/ios/documentation/Miscellaneous/Reference/UTIRef/Articles/System-DeclaredUniformTypeIdentifiers.html
   */
  static types = PlatformTypes[Platform.OS] || Types.mimeTypes;

  static pick(opts) {
    const options = {
      ...opts,
      multiple: false,
    };

    return pick(options).then((results) => results[0]);
  }

  static pickMultiple(opts) {
    const options = {
      ...opts,
      multiple: true,
    };

    return pick(options);
  }

  static isCancel(err) {
    return err && err.code === E_DOCUMENT_PICKER_CANCELED;
  }
}
