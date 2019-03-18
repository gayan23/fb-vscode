/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable, IDisposable } from 'vs/base/common/lifecycle';
import { IFileService, IResolveFileOptions, IResourceEncodings, FileChangesEvent, FileOperationEvent, IFileSystemProviderRegistrationEvent, IFileSystemProvider, IFileStat, IResolveFileResult, IResolveContentOptions, IContent, IStreamContent, ITextSnapshot, IUpdateContentOptions, ICreateFileOptions } from 'vs/platform/files/common/files';
import { URI } from 'vs/base/common/uri';
import { Event, Emitter } from 'vs/base/common/event';
import { ServiceIdentifier } from 'vs/platform/instantiation/common/instantiation';
import { registerSingleton } from 'vs/platform/instantiation/common/extensions';

export class FileService2 extends Disposable implements IFileService {

	//#region TODO@Ben HACKS

	private _impl: IFileService;

	setImpl(service: IFileService): void {
		this._impl = this._register(service);

		this._register(service.onFileChanges(e => this._onFileChanges.fire(e)));
		this._register(service.onAfterOperation(e => this._onAfterOperation.fire(e)));
		this._register(service.onDidChangeFileSystemProviderRegistrations(e => this._onDidChangeFileSystemProviderRegistrations.fire(e)));
	}

	//#endregion

	_serviceBrand: ServiceIdentifier<any>;

	private _onAfterOperation: Emitter<FileOperationEvent> = this._register(new Emitter<FileOperationEvent>());
	get onAfterOperation(): Event<FileOperationEvent> { return this._onAfterOperation.event; }

	constructor() {
		super();
	}

	//#region File System Provider

	private _onDidChangeFileSystemProviderRegistrations: Emitter<IFileSystemProviderRegistrationEvent> = this._register(new Emitter<IFileSystemProviderRegistrationEvent>());
	get onDidChangeFileSystemProviderRegistrations(): Event<IFileSystemProviderRegistrationEvent> { return this._onDidChangeFileSystemProviderRegistrations.event; }

	registerProvider(scheme: string, provider: IFileSystemProvider): IDisposable {
		return this._impl.registerProvider(scheme, provider);
	}

	activateProvider(scheme: string): Promise<void> {
		return this._impl.activateProvider(scheme);
	}

	canHandleResource(resource: URI): boolean {
		return this._impl.canHandleResource(resource);
	}

	//#endregion

	//#region File Metadata Resolving

	readFolder(resource: URI): Promise<string[]> {
		return this._impl.readFolder(resource);
	}

	resolveFile(resource: URI, options?: IResolveFileOptions): Promise<IFileStat> {
		return this._impl.resolveFile(resource, options);
	}

	resolveFiles(toResolve: { resource: URI; options?: IResolveFileOptions; }[]): Promise<IResolveFileResult[]> {
		return this._impl.resolveFiles(toResolve);
	}

	existsFile(resource: URI): Promise<boolean> {
		return this._impl.existsFile(resource);
	}

	//#endregion

	//#region File Reading/Writing

	get encoding(): IResourceEncodings { return this._impl.encoding; }

	createFile(resource: URI, content?: string, options?: ICreateFileOptions): Promise<IFileStat> {
		return this._impl.createFile(resource, content, options);
	}

	resolveContent(resource: URI, options?: IResolveContentOptions): Promise<IContent> {
		return this._impl.resolveContent(resource, options);
	}

	resolveStreamContent(resource: URI, options?: IResolveContentOptions): Promise<IStreamContent> {
		return this._impl.resolveStreamContent(resource, options);
	}

	updateContent(resource: URI, value: string | ITextSnapshot, options?: IUpdateContentOptions): Promise<IFileStat> {
		return this._impl.updateContent(resource, value, options);
	}

	//#endregion

	//#region Move/Copy/Delete/Create Folder

	moveFile(source: URI, target: URI, overwrite?: boolean): Promise<IFileStat> {
		return this._impl.moveFile(source, target, overwrite);
	}

	copyFile(source: URI, target: URI, overwrite?: boolean): Promise<IFileStat> {
		return this._impl.copyFile(source, target, overwrite);
	}

	createFolder(resource: URI): Promise<IFileStat> {
		return this._impl.createFolder(resource);
	}

	del(resource: URI, options?: { useTrash?: boolean; recursive?: boolean; }): Promise<void> {
		return this._impl.del(resource, options);
	}

	//#endregion

	//#region File Watching

	private _onFileChanges: Emitter<FileChangesEvent> = this._register(new Emitter<FileChangesEvent>());
	get onFileChanges(): Event<FileChangesEvent> { return this._onFileChanges.event; }

	watchFileChanges(resource: URI): void {
		this._impl.watchFileChanges(resource);
	}

	unwatchFileChanges(resource: URI): void {
		this._impl.unwatchFileChanges(resource);
	}

	//#endregion
}

registerSingleton(IFileService, FileService2);